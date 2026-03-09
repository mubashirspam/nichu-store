# Nichu Tracker - Full Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           NICHU ECOSYSTEM                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   ┌──────────────────────┐         ┌──────────────────────┐                 │
│   │   EXISTING WEB APP   │         │   NEW FLUTTER APP    │                 │
│   │   (Next.js 15)       │         │   (Android/iOS)      │                 │
│   │                      │         │                      │                 │
│   │  • E-commerce store  │         │  • Daily logging UI  │                 │
│   │  • Template purchase │         │  • Quick habit entry │                 │
│   │  • User accounts     │         │  • Offline support   │                 │
│   │  • NEW: Web tracker  │         │  • Dashboard view    │                 │
│   └──────────┬───────────┘         └──────────┬───────────┘                 │
│              │                                 │                             │
│              │         ┌───────────────┐       │                             │
│              └────────►│  Neon DB      │◄──────┘                             │
│                        │  (User data,  │                                     │
│                        │   purchases,  │                                     │
│                        │   templates)  │                                     │
│                        └───────────────┘                                     │
│                                                                              │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                    USER'S OWN CLOUD STORAGE                          │   │
│   │                                                                      │   │
│   │   ┌─────────────────────┐      ┌─────────────────────┐              │   │
│   │   │   Google Drive      │      │   OneDrive          │              │   │
│   │   │   (Google Sheets)   │      │   (Excel Online)    │              │   │
│   │   │                     │      │                     │              │   │
│   │   │   User's cloned     │      │   User's cloned     │              │   │
│   │   │   tracker template  │      │   tracker template  │              │   │
│   │   └─────────────────────┘      └─────────────────────┘              │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Part 1: Web App Feature Module (Next.js)

### New Database Schema Additions

```sql
-- Add to existing neon-setup.sql

-- User's linked cloud accounts
CREATE TABLE user_cloud_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  provider VARCHAR(20) NOT NULL, -- 'google' | 'microsoft'
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  token_expires_at TIMESTAMP WITH TIME ZONE,
  email VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, provider)
);

-- User's tracker files (cloned templates)
CREATE TABLE user_trackers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id),
  cloud_account_id UUID NOT NULL REFERENCES user_cloud_accounts(id),
  file_id VARCHAR(255) NOT NULL, -- Google Drive file ID or OneDrive item ID
  file_url TEXT,
  tracker_type VARCHAR(50) NOT NULL, -- 'habit' | 'financial' | 'workout' | 'nutrition'
  is_active BOOLEAN DEFAULT true,
  last_synced_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, product_id, cloud_account_id)
);

-- Master template references (admin manages these)
CREATE TABLE master_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id),
  provider VARCHAR(20) NOT NULL, -- 'google' | 'microsoft'
  file_id VARCHAR(255) NOT NULL, -- Your master template file ID
  file_url TEXT,
  version VARCHAR(20) DEFAULT '1.0',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(product_id, provider)
);

-- Sync logs for debugging
CREATE TABLE sync_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_tracker_id UUID NOT NULL REFERENCES user_trackers(id) ON DELETE CASCADE,
  action VARCHAR(50) NOT NULL, -- 'write' | 'read' | 'clone' | 'error'
  data JSONB,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_user_cloud_accounts_user ON user_cloud_accounts(user_id);
CREATE INDEX idx_user_trackers_user ON user_trackers(user_id);
CREATE INDEX idx_sync_logs_tracker ON sync_logs(user_tracker_id);
```

### New Drizzle Schema (`src/lib/db/schema.ts` additions)

```typescript
// Add these to existing schema.ts

export const userCloudAccounts = pgTable('user_cloud_accounts', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  provider: varchar('provider', { length: 20 }).notNull(), // 'google' | 'microsoft'
  accessToken: text('access_token').notNull(),
  refreshToken: text('refresh_token'),
  tokenExpiresAt: timestamp('token_expires_at', { withTimezone: true }),
  email: varchar('email', { length: 255 }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

export const userTrackers = pgTable('user_trackers', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  productId: uuid('product_id').notNull().references(() => products.id),
  cloudAccountId: uuid('cloud_account_id').notNull().references(() => userCloudAccounts.id),
  fileId: varchar('file_id', { length: 255 }).notNull(),
  fileUrl: text('file_url'),
  trackerType: varchar('tracker_type', { length: 50 }).notNull(),
  isActive: boolean('is_active').default(true),
  lastSyncedAt: timestamp('last_synced_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export const masterTemplates = pgTable('master_templates', {
  id: uuid('id').primaryKey().defaultRandom(),
  productId: uuid('product_id').notNull().references(() => products.id),
  provider: varchar('provider', { length: 20 }).notNull(),
  fileId: varchar('file_id', { length: 255 }).notNull(),
  fileUrl: text('file_url'),
  version: varchar('version', { length: 20 }).default('1.0'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

export const syncLogs = pgTable('sync_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  userTrackerId: uuid('user_tracker_id').notNull().references(() => userTrackers.id, { onDelete: 'cascade' }),
  action: varchar('action', { length: 50 }).notNull(),
  data: jsonb('data'),
  errorMessage: text('error_message'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});
```

### New Route Structure

```
src/app/
├── tracker/                          # NEW: Tracker feature module
│   ├── page.tsx                      # Tracker dashboard (list user's trackers)
│   ├── layout.tsx                    # Tracker layout with nav
│   ├── [trackerId]/
│   │   ├── page.tsx                  # Individual tracker view
│   │   ├── log/
│   │   │   └── page.tsx              # Daily logging interface
│   │   └── summary/
│   │       └── page.tsx              # Summary/analytics view
│   ├── setup/
│   │   ├── page.tsx                  # Initial tracker setup
│   │   └── connect/
│   │       ├── google/
│   │       │   └── callback/
│   │       │       └── route.ts      # Google OAuth callback
│   │       └── microsoft/
│   │           └── callback/
│   │               └── route.ts      # Microsoft OAuth callback
│   └── components/
│       ├── TrackerCard.tsx
│       ├── DailyLogForm.tsx
│       ├── HabitLogger.tsx
│       ├── FinancialLogger.tsx
│       ├── WorkoutLogger.tsx
│       └── NutritionLogger.tsx
│
├── api/
│   ├── tracker/                      # NEW: Tracker APIs
│   │   ├── route.ts                  # GET: list trackers, POST: create tracker
│   │   ├── [trackerId]/
│   │   │   ├── route.ts              # GET/PATCH/DELETE tracker
│   │   │   ├── log/
│   │   │   │   └── route.ts          # POST: write daily log to Sheet/Excel
│   │   │   └── data/
│   │   │       └── route.ts          # GET: read data from Sheet/Excel
│   │   └── clone/
│   │       └── route.ts              # POST: clone master template
│   │
│   ├── cloud/                        # NEW: Cloud account APIs
│   │   ├── google/
│   │   │   ├── auth/
│   │   │   │   └── route.ts          # Initiate Google OAuth
│   │   │   ├── callback/
│   │   │   │   └── route.ts          # Handle OAuth callback
│   │   │   └── refresh/
│   │   │       └── route.ts          # Refresh access token
│   │   └── microsoft/
│   │       ├── auth/
│   │       │   └── route.ts          # Initiate Microsoft OAuth
│   │       ├── callback/
│   │       │   └── route.ts          # Handle OAuth callback
│   │       └── refresh/
│   │           └── route.ts          # Refresh access token
│   │
│   └── mobile/                       # NEW: Mobile app APIs
│       ├── auth/
│       │   └── route.ts              # Exchange OAuth tokens for session
│       ├── trackers/
│       │   └── route.ts              # List user's trackers
│       └── sync/
│           └── route.ts              # Sync status endpoint
```

### New API Routes

#### `src/app/api/tracker/clone/route.ts`
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { db } from '@/lib/db';
import { userTrackers, userCloudAccounts, masterTemplates } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { cloneGoogleSheet, cloneOneDriveFile } from '@/lib/cloud';

export async function POST(request: NextRequest) {
  const userId = await requireAuth();
  const { productId, cloudAccountId } = await request.json();

  // Get user's cloud account
  const [cloudAccount] = await db
    .select()
    .from(userCloudAccounts)
    .where(and(
      eq(userCloudAccounts.id, cloudAccountId),
      eq(userCloudAccounts.userId, userId)
    ));

  if (!cloudAccount) {
    return NextResponse.json({ error: 'Cloud account not found' }, { status: 404 });
  }

  // Get master template for this product + provider
  const [template] = await db
    .select()
    .from(masterTemplates)
    .where(and(
      eq(masterTemplates.productId, productId),
      eq(masterTemplates.provider, cloudAccount.provider)
    ));

  if (!template) {
    return NextResponse.json({ error: 'Template not found' }, { status: 404 });
  }

  // Clone the template to user's drive
  let clonedFile;
  if (cloudAccount.provider === 'google') {
    clonedFile = await cloneGoogleSheet(
      cloudAccount.accessToken,
      template.fileId,
      `Nichu Tracker - ${new Date().toLocaleDateString()}`
    );
  } else {
    clonedFile = await cloneOneDriveFile(
      cloudAccount.accessToken,
      template.fileId,
      `Nichu Tracker - ${new Date().toLocaleDateString()}`
    );
  }

  // Save tracker reference
  const [tracker] = await db
    .insert(userTrackers)
    .values({
      userId,
      productId,
      cloudAccountId,
      fileId: clonedFile.id,
      fileUrl: clonedFile.webViewLink,
      trackerType: template.trackerType,
    })
    .returning();

  return NextResponse.json(tracker);
}
```

#### `src/app/api/tracker/[trackerId]/log/route.ts`
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { db } from '@/lib/db';
import { userTrackers, userCloudAccounts, syncLogs } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { appendToGoogleSheet, appendToExcel } from '@/lib/cloud';

export async function POST(
  request: NextRequest,
  { params }: { params: { trackerId: string } }
) {
  const userId = await requireAuth();
  const { data, sheetName } = await request.json();

  // Get tracker with cloud account
  const [tracker] = await db
    .select({
      tracker: userTrackers,
      cloudAccount: userCloudAccounts,
    })
    .from(userTrackers)
    .innerJoin(userCloudAccounts, eq(userTrackers.cloudAccountId, userCloudAccounts.id))
    .where(and(
      eq(userTrackers.id, params.trackerId),
      eq(userTrackers.userId, userId)
    ));

  if (!tracker) {
    return NextResponse.json({ error: 'Tracker not found' }, { status: 404 });
  }

  try {
    // Check if token needs refresh
    const accessToken = await ensureValidToken(tracker.cloudAccount);

    // Append row to Sheet/Excel
    if (tracker.cloudAccount.provider === 'google') {
      await appendToGoogleSheet(
        accessToken,
        tracker.tracker.fileId,
        sheetName || 'Daily Log',
        [data] // Array of row values
      );
    } else {
      await appendToExcel(
        accessToken,
        tracker.tracker.fileId,
        sheetName || 'Daily Log',
        [data]
      );
    }

    // Update last synced
    await db
      .update(userTrackers)
      .set({ lastSyncedAt: new Date() })
      .where(eq(userTrackers.id, params.trackerId));

    // Log sync
    await db.insert(syncLogs).values({
      userTrackerId: params.trackerId,
      action: 'write',
      data: { sheetName, rowCount: 1 },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    // Log error
    await db.insert(syncLogs).values({
      userTrackerId: params.trackerId,
      action: 'error',
      errorMessage: error.message,
    });

    return NextResponse.json({ error: 'Sync failed' }, { status: 500 });
  }
}
```

### Cloud Integration Library (`src/lib/cloud/`)

```
src/lib/cloud/
├── index.ts              # Re-exports
├── google.ts             # Google Sheets API wrapper
├── microsoft.ts          # Microsoft Graph API wrapper
├── oauth.ts              # OAuth helpers
└── types.ts              # Shared types
```

#### `src/lib/cloud/google.ts`
```typescript
const SHEETS_API = 'https://sheets.googleapis.com/v4/spreadsheets';
const DRIVE_API = 'https://www.googleapis.com/drive/v3';

export async function cloneGoogleSheet(
  accessToken: string,
  templateFileId: string,
  newName: string
): Promise<{ id: string; webViewLink: string }> {
  const response = await fetch(`${DRIVE_API}/files/${templateFileId}/copy`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: newName,
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to clone: ${await response.text()}`);
  }

  const file = await response.json();
  return {
    id: file.id,
    webViewLink: `https://docs.google.com/spreadsheets/d/${file.id}`,
  };
}

export async function appendToGoogleSheet(
  accessToken: string,
  spreadsheetId: string,
  sheetName: string,
  rows: any[][]
): Promise<void> {
  const range = `${sheetName}!A:Z`;
  
  const response = await fetch(
    `${SHEETS_API}/${spreadsheetId}/values/${encodeURIComponent(range)}:append?valueInputOption=USER_ENTERED`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        values: rows,
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to append: ${await response.text()}`);
  }
}

export async function readGoogleSheetRange(
  accessToken: string,
  spreadsheetId: string,
  range: string
): Promise<any[][]> {
  const response = await fetch(
    `${SHEETS_API}/${spreadsheetId}/values/${encodeURIComponent(range)}`,
    {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to read: ${await response.text()}`);
  }

  const data = await response.json();
  return data.values || [];
}
```

#### `src/lib/cloud/microsoft.ts`
```typescript
const GRAPH_API = 'https://graph.microsoft.com/v1.0';

export async function cloneOneDriveFile(
  accessToken: string,
  templateItemId: string,
  newName: string
): Promise<{ id: string; webViewLink: string }> {
  const response = await fetch(
    `${GRAPH_API}/me/drive/items/${templateItemId}/copy`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: newName,
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to clone: ${await response.text()}`);
  }

  // Copy is async, need to poll for completion
  const location = response.headers.get('Location');
  const file = await pollForCopyCompletion(accessToken, location);
  
  return {
    id: file.id,
    webViewLink: file.webUrl,
  };
}

export async function appendToExcel(
  accessToken: string,
  itemId: string,
  worksheetName: string,
  rows: any[][]
): Promise<void> {
  // First, get the used range to find next empty row
  const rangeResponse = await fetch(
    `${GRAPH_API}/me/drive/items/${itemId}/workbook/worksheets/${worksheetName}/usedRange`,
    {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    }
  );

  const usedRange = await rangeResponse.json();
  const nextRow = usedRange.rowCount + 1;

  // Write to next available row
  const range = `A${nextRow}:${String.fromCharCode(64 + rows[0].length)}${nextRow + rows.length - 1}`;
  
  await fetch(
    `${GRAPH_API}/me/drive/items/${itemId}/workbook/worksheets/${worksheetName}/range(address='${range}')`,
    {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        values: rows,
      }),
    }
  );
}
```

### New Environment Variables

```env
# Add to existing .env

# Google Cloud (for Sheets API)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=https://yourdomain.com/api/cloud/google/callback

# Microsoft Azure (for Graph API)
MICROSOFT_CLIENT_ID=your-azure-client-id
MICROSOFT_CLIENT_SECRET=your-azure-client-secret
MICROSOFT_REDIRECT_URI=https://yourdomain.com/api/cloud/microsoft/callback

# Master template IDs (set in admin)
# These are stored in master_templates table
```

---

## Part 2: Flutter Mobile App Architecture

### Project Structure

```
nichu_tracker_app/
├── android/
├── ios/
├── lib/
│   ├── main.dart
│   ├── app.dart
│   │
│   ├── core/
│   │   ├── config/
│   │   │   ├── app_config.dart
│   │   │   ├── api_config.dart
│   │   │   └── theme_config.dart
│   │   ├── constants/
│   │   │   ├── app_constants.dart
│   │   │   ├── storage_keys.dart
│   │   │   └── api_endpoints.dart
│   │   ├── errors/
│   │   │   ├── exceptions.dart
│   │   │   └── failures.dart
│   │   ├── network/
│   │   │   ├── api_client.dart
│   │   │   ├── interceptors.dart
│   │   │   └── network_info.dart
│   │   └── utils/
│   │       ├── date_utils.dart
│   │       ├── validators.dart
│   │       └── extensions.dart
│   │
│   ├── data/
│   │   ├── datasources/
│   │   │   ├── local/
│   │   │   │   ├── local_storage.dart
│   │   │   │   ├── secure_storage.dart
│   │   │   │   └── hive_database.dart
│   │   │   └── remote/
│   │   │       ├── auth_remote.dart
│   │   │       ├── tracker_remote.dart
│   │   │       ├── google_sheets_remote.dart
│   │   │       └── microsoft_graph_remote.dart
│   │   ├── models/
│   │   │   ├── user_model.dart
│   │   │   ├── tracker_model.dart
│   │   │   ├── cloud_account_model.dart
│   │   │   ├── log_entry_model.dart
│   │   │   └── sync_status_model.dart
│   │   └── repositories/
│   │       ├── auth_repository_impl.dart
│   │       ├── tracker_repository_impl.dart
│   │       └── cloud_repository_impl.dart
│   │
│   ├── domain/
│   │   ├── entities/
│   │   │   ├── user.dart
│   │   │   ├── tracker.dart
│   │   │   ├── cloud_account.dart
│   │   │   └── log_entry.dart
│   │   ├── repositories/
│   │   │   ├── auth_repository.dart
│   │   │   ├── tracker_repository.dart
│   │   │   └── cloud_repository.dart
│   │   └── usecases/
│   │       ├── auth/
│   │       │   ├── sign_in_google.dart
│   │       │   ├── sign_in_microsoft.dart
│   │       │   └── sign_out.dart
│   │       ├── tracker/
│   │       │   ├── get_trackers.dart
│   │       │   ├── setup_tracker.dart
│   │       │   └── clone_template.dart
│   │       └── logging/
│   │           ├── log_habit.dart
│   │           ├── log_workout.dart
│   │           ├── log_financial.dart
│   │           └── sync_logs.dart
│   │
│   ├── presentation/
│   │   ├── app/
│   │   │   ├── app_router.dart
│   │   │   └── app_theme.dart
│   │   ├── blocs/
│   │   │   ├── auth/
│   │   │   │   ├── auth_bloc.dart
│   │   │   │   ├── auth_event.dart
│   │   │   │   └── auth_state.dart
│   │   │   ├── tracker/
│   │   │   │   ├── tracker_bloc.dart
│   │   │   │   ├── tracker_event.dart
│   │   │   │   └── tracker_state.dart
│   │   │   └── logging/
│   │   │       ├── logging_bloc.dart
│   │   │       ├── logging_event.dart
│   │   │       └── logging_state.dart
│   │   ├── screens/
│   │   │   ├── splash/
│   │   │   │   └── splash_screen.dart
│   │   │   ├── onboarding/
│   │   │   │   ├── onboarding_screen.dart
│   │   │   │   └── connect_cloud_screen.dart
│   │   │   ├── auth/
│   │   │   │   └── auth_screen.dart
│   │   │   ├── home/
│   │   │   │   ├── home_screen.dart
│   │   │   │   └── widgets/
│   │   │   │       ├── tracker_card.dart
│   │   │   │       ├── quick_log_widget.dart
│   │   │   │       └── today_summary.dart
│   │   │   ├── tracker/
│   │   │   │   ├── tracker_detail_screen.dart
│   │   │   │   └── tracker_setup_screen.dart
│   │   │   ├── logging/
│   │   │   │   ├── daily_log_screen.dart
│   │   │   │   ├── habit_log_screen.dart
│   │   │   │   ├── workout_log_screen.dart
│   │   │   │   ├── financial_log_screen.dart
│   │   │   │   └── nutrition_log_screen.dart
│   │   │   ├── summary/
│   │   │   │   ├── summary_screen.dart
│   │   │   │   └── widgets/
│   │   │   │       ├── streak_chart.dart
│   │   │   │       ├── progress_chart.dart
│   │   │   │       └── stats_card.dart
│   │   │   └── settings/
│   │   │       ├── settings_screen.dart
│   │   │       └── cloud_accounts_screen.dart
│   │   └── widgets/
│   │       ├── common/
│   │       │   ├── app_button.dart
│   │       │   ├── app_card.dart
│   │       │   ├── loading_overlay.dart
│   │       │   └── error_widget.dart
│   │       ├── forms/
│   │       │   ├── habit_form.dart
│   │       │   ├── workout_form.dart
│   │       │   ├── financial_form.dart
│   │       │   └── nutrition_form.dart
│   │       └── charts/
│   │           ├── weekly_chart.dart
│   │           └── monthly_chart.dart
│   │
│   └── di/
│       └── injection_container.dart
│
├── test/
│   ├── unit/
│   ├── widget/
│   └── integration/
│
├── pubspec.yaml
└── analysis_options.yaml
```

### Key Dependencies (`pubspec.yaml`)

```yaml
name: nichu_tracker
description: Daily habit & fitness tracker synced to Google Sheets/Excel

publish_to: 'none'
version: 1.0.0+1

environment:
  sdk: '>=3.2.0 <4.0.0'

dependencies:
  flutter:
    sdk: flutter
  
  # State Management
  flutter_bloc: ^8.1.3
  equatable: ^2.0.5
  
  # Dependency Injection
  get_it: ^7.6.4
  injectable: ^2.3.2
  
  # Network
  dio: ^5.4.0
  connectivity_plus: ^5.0.2
  
  # Local Storage
  hive: ^2.2.3
  hive_flutter: ^1.1.0
  flutter_secure_storage: ^9.0.0
  shared_preferences: ^2.2.2
  
  # Auth
  google_sign_in: ^6.2.1
  msal_flutter: ^2.1.0  # Microsoft Auth
  
  # Google APIs
  googleapis: ^12.0.0
  googleapis_auth: ^1.4.1
  
  # UI
  cupertino_icons: ^1.0.6
  flutter_svg: ^2.0.9
  cached_network_image: ^3.3.0
  shimmer: ^3.0.0
  
  # Charts
  fl_chart: ^0.65.0
  
  # Utils
  intl: ^0.18.1
  uuid: ^4.2.2
  logger: ^2.0.2
  
  # Navigation
  go_router: ^13.0.0

dev_dependencies:
  flutter_test:
    sdk: flutter
  flutter_lints: ^3.0.1
  build_runner: ^2.4.7
  injectable_generator: ^2.4.1
  hive_generator: ^2.0.1
  mockito: ^5.4.4
  bloc_test: ^9.1.5
```

### Core Files

#### `lib/main.dart`
```dart
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:hive_flutter/hive_flutter.dart';
import 'di/injection_container.dart' as di;
import 'presentation/app/app_router.dart';
import 'presentation/app/app_theme.dart';
import 'presentation/blocs/auth/auth_bloc.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // Initialize Hive for local storage
  await Hive.initFlutter();
  
  // Initialize dependency injection
  await di.init();
  
  runApp(const NichuTrackerApp());
}

class NichuTrackerApp extends StatelessWidget {
  const NichuTrackerApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiBlocProvider(
      providers: [
        BlocProvider(create: (_) => di.sl<AuthBloc>()..add(CheckAuthStatus())),
      ],
      child: MaterialApp.router(
        title: 'Nichu Tracker',
        theme: AppTheme.light,
        darkTheme: AppTheme.dark,
        themeMode: ThemeMode.system,
        routerConfig: AppRouter.router,
        debugShowCheckedModeBanner: false,
      ),
    );
  }
}
```

#### `lib/data/datasources/remote/google_sheets_remote.dart`
```dart
import 'package:googleapis/sheets/v4.dart' as sheets;
import 'package:googleapis/drive/v3.dart' as drive;
import 'package:googleapis_auth/auth_io.dart';
import 'package:google_sign_in/google_sign_in.dart';

class GoogleSheetsRemote {
  final GoogleSignIn _googleSignIn;
  
  GoogleSheetsRemote(this._googleSignIn);

  Future<AuthClient> _getAuthClient() async {
    final account = await _googleSignIn.signInSilently();
    if (account == null) throw Exception('Not signed in');
    
    final auth = await account.authentication;
    final credentials = AccessCredentials(
      AccessToken('Bearer', auth.accessToken!, DateTime.now().add(Duration(hours: 1))),
      auth.idToken,
      ['https://www.googleapis.com/auth/spreadsheets', 'https://www.googleapis.com/auth/drive.file'],
    );
    
    return authenticatedClient(http.Client(), credentials);
  }

  Future<String> cloneTemplate(String templateId, String newName) async {
    final client = await _getAuthClient();
    final driveApi = drive.DriveApi(client);
    
    final copiedFile = await driveApi.files.copy(
      drive.File(name: newName),
      templateId,
    );
    
    client.close();
    return copiedFile.id!;
  }

  Future<void> appendRow(String spreadsheetId, String sheetName, List<Object> values) async {
    final client = await _getAuthClient();
    final sheetsApi = sheets.SheetsApi(client);
    
    final range = '$sheetName!A:Z';
    final valueRange = sheets.ValueRange(values: [values]);
    
    await sheetsApi.spreadsheets.values.append(
      valueRange,
      spreadsheetId,
      range,
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
    );
    
    client.close();
  }

  Future<List<List<Object>>> readRange(String spreadsheetId, String range) async {
    final client = await _getAuthClient();
    final sheetsApi = sheets.SheetsApi(client);
    
    final response = await sheetsApi.spreadsheets.values.get(spreadsheetId, range);
    
    client.close();
    return response.values ?? [];
  }
}
```

#### `lib/presentation/screens/logging/habit_log_screen.dart`
```dart
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../blocs/logging/logging_bloc.dart';
import '../../widgets/forms/habit_form.dart';

class HabitLogScreen extends StatelessWidget {
  final String trackerId;

  const HabitLogScreen({super.key, required this.trackerId});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Log Habits'),
        actions: [
          IconButton(
            icon: const Icon(Icons.open_in_new),
            onPressed: () => _openInSheets(context),
            tooltip: 'Open in Google Sheets',
          ),
        ],
      ),
      body: BlocConsumer<LoggingBloc, LoggingState>(
        listener: (context, state) {
          if (state is LoggingSuccess) {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(content: Text('Logged successfully! ✓')),
            );
            Navigator.pop(context);
          }
          if (state is LoggingError) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(content: Text('Error: ${state.message}')),
            );
          }
        },
        builder: (context, state) {
          return SingleChildScrollView(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                // Today's date card
                _buildDateCard(),
                const SizedBox(height: 24),
                
                // Habit form
                HabitForm(
                  onSubmit: (data) {
                    context.read<LoggingBloc>().add(
                      LogHabitEntry(trackerId: trackerId, data: data),
                    );
                  },
                ),
                
                const SizedBox(height: 16),
                
                // Submit button
                ElevatedButton(
                  onPressed: state is LoggingLoading
                      ? null
                      : () => _submitForm(context),
                  style: ElevatedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(vertical: 16),
                  ),
                  child: state is LoggingLoading
                      ? const SizedBox(
                          height: 20,
                          width: 20,
                          child: CircularProgressIndicator(strokeWidth: 2),
                        )
                      : const Text('Save to Sheet'),
                ),
              ],
            ),
          );
        },
      ),
    );
  }

  Widget _buildDateCard() {
    final now = DateTime.now();
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Row(
          children: [
            Icon(Icons.calendar_today, color: Colors.blue.shade600),
            const SizedBox(width: 12),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  DateFormat('EEEE').format(now),
                  style: const TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                Text(
                  DateFormat('MMMM d, yyyy').format(now),
                  style: TextStyle(color: Colors.grey.shade600),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  void _submitForm(BuildContext context) {
    // Trigger form validation and submission
  }

  void _openInSheets(BuildContext context) {
    // Deep link to Google Sheets
  }
}
```

#### `lib/presentation/widgets/forms/habit_form.dart`
```dart
import 'package:flutter/material.dart';

class HabitForm extends StatefulWidget {
  final Function(Map<String, dynamic>) onSubmit;

  const HabitForm({super.key, required this.onSubmit});

  @override
  State<HabitForm> createState() => _HabitFormState();
}

class _HabitFormState extends State<HabitForm> {
  // Habit toggles
  bool _workout = false;
  bool _meditation = false;
  bool _reading = false;
  bool _water = false;
  bool _sleep8hrs = false;
  bool _noJunkFood = false;
  
  // Additional fields
  int _waterGlasses = 0;
  int _sleepHours = 0;
  String _notes = '';

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Today\'s Habits',
          style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 16),
        
        // Habit toggles
        _buildHabitTile('💪 Workout', _workout, (v) => setState(() => _workout = v!)),
        _buildHabitTile('🧘 Meditation', _meditation, (v) => setState(() => _meditation = v!)),
        _buildHabitTile('📚 Reading', _reading, (v) => setState(() => _reading = v!)),
        _buildHabitTile('💧 8+ Glasses Water', _water, (v) => setState(() => _water = v!)),
        _buildHabitTile('😴 8 Hours Sleep', _sleep8hrs, (v) => setState(() => _sleep8hrs = v!)),
        _buildHabitTile('🥗 No Junk Food', _noJunkFood, (v) => setState(() => _noJunkFood = v!)),
        
        const SizedBox(height: 24),
        
        // Water glasses counter
        const Text('Water Glasses', style: TextStyle(fontWeight: FontWeight.w500)),
        const SizedBox(height: 8),
        Row(
          children: [
            IconButton(
              onPressed: _waterGlasses > 0 ? () => setState(() => _waterGlasses--) : null,
              icon: const Icon(Icons.remove_circle_outline),
            ),
            Text('$_waterGlasses', style: const TextStyle(fontSize: 24)),
            IconButton(
              onPressed: () => setState(() => _waterGlasses++),
              icon: const Icon(Icons.add_circle_outline),
            ),
          ],
        ),
        
        const SizedBox(height: 16),
        
        // Sleep hours slider
        const Text('Sleep Hours', style: TextStyle(fontWeight: FontWeight.w500)),
        Slider(
          value: _sleepHours.toDouble(),
          min: 0,
          max: 12,
          divisions: 12,
          label: '$_sleepHours hrs',
          onChanged: (v) => setState(() => _sleepHours = v.round()),
        ),
        
        const SizedBox(height: 16),
        
        // Notes
        TextField(
          decoration: const InputDecoration(
            labelText: 'Notes (optional)',
            border: OutlineInputBorder(),
          ),
          maxLines: 3,
          onChanged: (v) => _notes = v,
        ),
      ],
    );
  }

  Widget _buildHabitTile(String label, bool value, Function(bool?) onChanged) {
    return CheckboxListTile(
      title: Text(label),
      value: value,
      onChanged: onChanged,
      controlAffinity: ListTileControlAffinity.leading,
      contentPadding: EdgeInsets.zero,
    );
  }

  Map<String, dynamic> getData() {
    final now = DateTime.now();
    return {
      'date': DateFormat('yyyy-MM-dd').format(now),
      'workout': _workout ? 1 : 0,
      'meditation': _meditation ? 1 : 0,
      'reading': _reading ? 1 : 0,
      'water_8_glasses': _water ? 1 : 0,
      'water_glasses': _waterGlasses,
      'sleep_8hrs': _sleep8hrs ? 1 : 0,
      'sleep_hours': _sleepHours,
      'no_junk_food': _noJunkFood ? 1 : 0,
      'notes': _notes,
    };
  }
}
```

---

## Part 3: Data Sync Architecture

### Offline-First Strategy

```
┌─────────────────────────────────────────────────────────────────┐
│                    OFFLINE-FIRST SYNC FLOW                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   User Logs Entry                                                │
│         │                                                        │
│         ▼                                                        │
│   ┌─────────────────┐                                           │
│   │  Save to Hive   │  ← Always succeeds                        │
│   │  (Local DB)     │                                           │
│   └────────┬────────┘                                           │
│            │                                                     │
│            ▼                                                     │
│   ┌─────────────────┐     ┌─────────────────┐                   │
│   │ Check Network   │────►│  Queue for      │  ← If offline     │
│   │                 │     │  Later Sync     │                   │
│   └────────┬────────┘     └─────────────────┘                   │
│            │ Online                                              │
│            ▼                                                     │
│   ┌─────────────────┐                                           │
│   │  Sync to Sheet  │                                           │
│   │  (Google/Excel) │                                           │
│   └────────┬────────┘                                           │
│            │                                                     │
│            ▼                                                     │
│   ┌─────────────────┐                                           │
│   │  Mark as Synced │                                           │
│   │  in Local DB    │                                           │
│   └─────────────────┘                                           │
│                                                                  │
│   Background Sync Service:                                       │
│   - Runs every 15 minutes when app is open                      │
│   - Runs on app launch                                          │
│   - Runs when connectivity restored                             │
│   - Syncs all pending entries                                   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Local Database Schema (Hive)

```dart
// lib/data/models/local/pending_log.dart
import 'package:hive/hive.dart';

part 'pending_log.g.dart';

@HiveType(typeId: 0)
class PendingLog extends HiveObject {
  @HiveField(0)
  final String id;
  
  @HiveField(1)
  final String trackerId;
  
  @HiveField(2)
  final String trackerType; // 'habit' | 'workout' | 'financial' | 'nutrition'
  
  @HiveField(3)
  final String sheetName;
  
  @HiveField(4)
  final Map<String, dynamic> data;
  
  @HiveField(5)
  final DateTime createdAt;
  
  @HiveField(6)
  final DateTime? syncedAt;
  
  @HiveField(7)
  final int retryCount;
  
  @HiveField(8)
  final String? errorMessage;

  PendingLog({
    required this.id,
    required this.trackerId,
    required this.trackerType,
    required this.sheetName,
    required this.data,
    required this.createdAt,
    this.syncedAt,
    this.retryCount = 0,
    this.errorMessage,
  });

  bool get isSynced => syncedAt != null;
  bool get isPending => syncedAt == null;
  
  List<Object> toRowValues() {
    // Convert data map to row array based on tracker type
    switch (trackerType) {
      case 'habit':
        return [
          data['date'],
          data['workout'],
          data['meditation'],
          data['reading'],
          data['water_glasses'],
          data['sleep_hours'],
          data['notes'] ?? '',
        ];
      case 'workout':
        return [
          data['date'],
          data['exercise_type'],
          data['duration_minutes'],
          data['sets'],
          data['reps'],
          data['weight'],
          data['notes'] ?? '',
        ];
      // ... other tracker types
      default:
        return data.values.toList();
    }
  }
}
```

### Sync Service

```dart
// lib/data/services/sync_service.dart
import 'dart:async';
import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:hive/hive.dart';
import '../datasources/remote/google_sheets_remote.dart';
import '../datasources/remote/microsoft_graph_remote.dart';
import '../models/local/pending_log.dart';

class SyncService {
  final GoogleSheetsRemote _googleSheets;
  final MicrosoftGraphRemote _microsoftGraph;
  final Box<PendingLog> _pendingLogsBox;
  
  Timer? _periodicSync;
  StreamSubscription? _connectivitySubscription;

  SyncService(this._googleSheets, this._microsoftGraph, this._pendingLogsBox);

  void startBackgroundSync() {
    // Sync every 15 minutes
    _periodicSync = Timer.periodic(const Duration(minutes: 15), (_) => syncAll());
    
    // Sync when connectivity changes to online
    _connectivitySubscription = Connectivity().onConnectivityChanged.listen((result) {
      if (result != ConnectivityResult.none) {
        syncAll();
      }
    });
  }

  void stopBackgroundSync() {
    _periodicSync?.cancel();
    _connectivitySubscription?.cancel();
  }

  Future<void> syncAll() async {
    final pendingLogs = _pendingLogsBox.values.where((log) => log.isPending).toList();
    
    for (final log in pendingLogs) {
      try {
        await _syncLog(log);
        
        // Mark as synced
        log.syncedAt = DateTime.now();
        await log.save();
      } catch (e) {
        // Update retry count
        log.retryCount++;
        log.errorMessage = e.toString();
        await log.save();
        
        // Stop retrying after 5 attempts
        if (log.retryCount >= 5) {
          // Notify user of persistent failure
        }
      }
    }
  }

  Future<void> _syncLog(PendingLog log) async {
    // Get tracker info to determine provider
    final tracker = await _getTracker(log.trackerId);
    
    if (tracker.provider == 'google') {
      await _googleSheets.appendRow(
        tracker.fileId,
        log.sheetName,
        log.toRowValues(),
      );
    } else {
      await _microsoftGraph.appendRow(
        tracker.fileId,
        log.sheetName,
        log.toRowValues(),
      );
    }
  }

  Future<int> getPendingCount() async {
    return _pendingLogsBox.values.where((log) => log.isPending).length;
  }
}
```

---

## Part 4: Authentication Flow

### Web + Mobile Unified Auth

```
┌─────────────────────────────────────────────────────────────────┐
│                    AUTHENTICATION FLOW                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   ┌─────────────┐                      ┌─────────────┐          │
│   │   WEB APP   │                      │ FLUTTER APP │          │
│   │  (Next.js)  │                      │             │          │
│   └──────┬──────┘                      └──────┬──────┘          │
│          │                                    │                  │
│          │  Better Auth                       │  Google Sign-In  │
│          │  (existing)                        │  + MSAL          │
│          ▼                                    ▼                  │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │                    Neon DB                               │   │
│   │                                                          │   │
│   │   profiles          user_cloud_accounts                  │   │
│   │   ─────────         ─────────────────────                │   │
│   │   id                user_id → profiles.id                │   │
│   │   email             provider (google/microsoft)          │   │
│   │   name              access_token                         │   │
│   │   is_admin          refresh_token                        │   │
│   │                     token_expires_at                     │   │
│   └─────────────────────────────────────────────────────────┘   │
│                                                                  │
│   Mobile OAuth Flow:                                             │
│   1. User taps "Sign in with Google/Microsoft"                  │
│   2. Native OAuth library handles consent                        │
│   3. Get access_token + refresh_token                           │
│   4. POST tokens to /api/mobile/auth                            │
│   5. Backend creates/updates user in Neon                       │
│   6. Return session token to app                                │
│   7. Store session in secure storage                            │
│                                                                  │
│   Token Refresh:                                                 │
│   - Mobile app refreshes Google/Microsoft tokens locally        │
│   - Updates backend via /api/cloud/{provider}/refresh           │
│   - Sheets/Excel API calls always use fresh tokens              │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Mobile Auth API (`src/app/api/mobile/auth/route.ts`)

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { profiles, userCloudAccounts } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { signJWT, verifyGoogleToken, verifyMicrosoftToken } from '@/lib/auth/mobile';

export async function POST(request: NextRequest) {
  const { provider, accessToken, refreshToken, idToken } = await request.json();

  // Verify the ID token and extract user info
  let userInfo;
  if (provider === 'google') {
    userInfo = await verifyGoogleToken(idToken);
  } else {
    userInfo = await verifyMicrosoftToken(idToken);
  }

  // Find or create user profile
  let [profile] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.email, userInfo.email));

  if (!profile) {
    [profile] = await db
      .insert(profiles)
      .values({
        email: userInfo.email,
        name: userInfo.name,
        avatarUrl: userInfo.picture,
      })
      .returning();
  }

  // Save/update cloud account credentials
  await db
    .insert(userCloudAccounts)
    .values({
      userId: profile.id,
      provider,
      accessToken,
      refreshToken,
      tokenExpiresAt: new Date(Date.now() + 3600 * 1000), // 1 hour
      email: userInfo.email,
    })
    .onConflictDoUpdate({
      target: [userCloudAccounts.userId, userCloudAccounts.provider],
      set: {
        accessToken,
        refreshToken,
        tokenExpiresAt: new Date(Date.now() + 3600 * 1000),
        updatedAt: new Date(),
      },
    });

  // Generate session token for mobile app
  const sessionToken = await signJWT({
    userId: profile.id,
    email: profile.email,
    provider,
  });

  return NextResponse.json({
    user: {
      id: profile.id,
      email: profile.email,
      name: profile.name,
      avatarUrl: profile.avatarUrl,
    },
    sessionToken,
  });
}
```

---

## Part 5: Template Column Mapping

### Master Template Structure

Your Excel/Google Sheets templates should follow this structure for each tracker type:

#### Habit Tracker Sheet: "Daily Log"
| Column | Field | Type | App Maps To |
|--------|-------|------|-------------|
| A | Date | Date | `data['date']` |
| B | Workout | 0/1 | `data['workout']` |
| C | Meditation | 0/1 | `data['meditation']` |
| D | Reading | 0/1 | `data['reading']` |
| E | Water Glasses | Number | `data['water_glasses']` |
| F | Sleep Hours | Number | `data['sleep_hours']` |
| G | No Junk Food | 0/1 | `data['no_junk_food']` |
| H | Notes | Text | `data['notes']` |

#### Workout Tracker Sheet: "Workouts"
| Column | Field | Type | App Maps To |
|--------|-------|------|-------------|
| A | Date | Date | `data['date']` |
| B | Exercise | Text | `data['exercise']` |
| C | Duration (min) | Number | `data['duration']` |
| D | Sets | Number | `data['sets']` |
| E | Reps | Number | `data['reps']` |
| F | Weight (kg) | Number | `data['weight']` |
| G | Notes | Text | `data['notes']` |

#### Financial Tracker Sheet: "Transactions"
| Column | Field | Type | App Maps To |
|--------|-------|------|-------------|
| A | Date | Date | `data['date']` |
| B | Category | Text | `data['category']` |
| C | Description | Text | `data['description']` |
| D | Amount | Number | `data['amount']` |
| E | Type | Income/Expense | `data['type']` |
| F | Payment Method | Text | `data['payment_method']` |
| G | Notes | Text | `data['notes']` |

#### Nutrition Tracker Sheet: "Meals"
| Column | Field | Type | App Maps To |
|--------|-------|------|-------------|
| A | Date | Date | `data['date']` |
| B | Meal | Breakfast/Lunch/Dinner/Snack | `data['meal']` |
| C | Food Item | Text | `data['food_item']` |
| D | Calories | Number | `data['calories']` |
| E | Protein (g) | Number | `data['protein']` |
| F | Carbs (g) | Number | `data['carbs']` |
| G | Fat (g) | Number | `data['fat']` |
| H | Notes | Text | `data['notes']` |

---

## Part 6: Admin Panel Additions

### New Admin Routes

```
src/app/admin/
├── templates/                    # NEW: Template management
│   ├── page.tsx                  # List master templates
│   └── [templateId]/
│       └── page.tsx              # Edit template settings
├── trackers/                     # NEW: User tracker management
│   ├── page.tsx                  # List all user trackers
│   └── [trackerId]/
│       └── page.tsx              # View tracker details/logs
└── sync-logs/                    # NEW: Sync monitoring
    └── page.tsx                  # View sync logs/errors
```

### Admin API for Templates

```typescript
// src/app/api/admin/templates/route.ts
export async function GET() {
  await isAdmin();
  
  const templates = await db
    .select()
    .from(masterTemplates)
    .innerJoin(products, eq(masterTemplates.productId, products.id));
  
  return NextResponse.json(templates);
}

export async function POST(request: NextRequest) {
  await isAdmin();
  const { productId, provider, fileId, fileUrl } = await request.json();
  
  const [template] = await db
    .insert(masterTemplates)
    .values({ productId, provider, fileId, fileUrl })
    .returning();
  
  return NextResponse.json(template);
}
```

---

## Part 7: Environment Setup

### Complete Environment Variables

```env
# ============================================
# EXISTING (Nichu Store)
# ============================================

# Database
DATABASE_URL=postgresql://...

# Neon Auth
NEON_AUTH_BASE_URL=https://...
NEON_AUTH_COOKIE_SECRET=<openssl rand -base64 32>

# Vercel Blob
BLOB_READ_WRITE_TOKEN=vercel_blob_...

# Razorpay
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_...
RAZORPAY_KEY_SECRET=...
RAZORPAY_WEBHOOK_SECRET=...


# ============================================
# NEW (Tracker Feature)
# ============================================

# Google Cloud Console
# Create at: https://console.cloud.google.com
# Enable: Google Sheets API, Google Drive API
GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxx
GOOGLE_REDIRECT_URI=https://yourdomain.com/api/cloud/google/callback

# Microsoft Azure AD
# Create at: https://portal.azure.com
# API Permissions: Files.ReadWrite, User.Read
MICROSOFT_CLIENT_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
MICROSOFT_CLIENT_SECRET=xxx
MICROSOFT_TENANT_ID=common  # or specific tenant
MICROSOFT_REDIRECT_URI=https://yourdomain.com/api/cloud/microsoft/callback

# Mobile App JWT
MOBILE_JWT_SECRET=<openssl rand -base64 32>
MOBILE_JWT_EXPIRY=30d

# Public URLs for mobile app
NEXT_PUBLIC_API_URL=https://yourdomain.com/api
```

### Flutter App Config

```dart
// lib/core/config/app_config.dart
class AppConfig {
  static const String apiBaseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'https://yourdomain.com/api',
  );
  
  static const String googleClientId = String.fromEnvironment(
    'GOOGLE_CLIENT_ID',
    defaultValue: 'xxx.apps.googleusercontent.com',
  );
  
  // iOS needs different client ID
  static const String googleClientIdIOS = String.fromEnvironment(
    'GOOGLE_CLIENT_ID_IOS',
    defaultValue: 'xxx.apps.googleusercontent.com',
  );
  
  static const String microsoftClientId = String.fromEnvironment(
    'MICROSOFT_CLIENT_ID',
    defaultValue: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
  );
}
```

---

## Part 8: Deployment Checklist

### Web (Netlify)
- [ ] Add new environment variables
- [ ] Run database migrations for new tables
- [ ] Update `netlify.toml` if needed
- [ ] Test OAuth callbacks

### Mobile (Flutter)
- [ ] Configure Google Sign-In (Firebase project or standalone)
- [ ] Configure Microsoft MSAL
- [ ] Set up Android/iOS OAuth redirect URIs
- [ ] Build and test on simulators
- [ ] Submit to App Store / Play Store

### Google Cloud Console
- [ ] Create OAuth 2.0 credentials
- [ ] Enable Google Sheets API
- [ ] Enable Google Drive API
- [ ] Add authorized redirect URIs
- [ ] Configure OAuth consent screen

### Microsoft Azure
- [ ] Register application
- [ ] Add API permissions (Files.ReadWrite, User.Read)
- [ ] Configure redirect URIs
- [ ] Create client secret

---

## Quick Reference: API Endpoints

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/tracker` | GET | User | List user's trackers |
| `/api/tracker` | POST | User | Create new tracker |
| `/api/tracker/clone` | POST | User | Clone master template |
| `/api/tracker/[id]` | GET | User | Get tracker details |
| `/api/tracker/[id]/log` | POST | User | Write daily log |
| `/api/tracker/[id]/data` | GET | User | Read tracker data |
| `/api/cloud/google/auth` | GET | User | Start Google OAuth |
| `/api/cloud/microsoft/auth` | GET | User | Start Microsoft OAuth |
| `/api/mobile/auth` | POST | Public | Exchange tokens for session |
| `/api/mobile/trackers` | GET | Mobile | List trackers for mobile |
| `/api/admin/templates` | CRUD | Admin | Manage master templates |

---

**Architecture Version**: 1.0  
**Last Updated**: March 2026