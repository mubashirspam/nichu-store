/**
 * Run: npx tsx scripts/migrate-tracker.ts
 * Adds only the 4 new tracker tables — does NOT touch existing tables.
 */
import { neon } from "@neondatabase/serverless";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const sql = neon(process.env.DATABASE_URL!);

async function run() {
  console.log("Running tracker migration...");

  await sql`
    CREATE TABLE IF NOT EXISTS user_cloud_accounts (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
      provider VARCHAR(20) NOT NULL,
      access_token TEXT NOT NULL,
      refresh_token TEXT,
      token_expires_at TIMESTAMPTZ,
      email VARCHAR(255),
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(user_id, provider)
    )
  `;
  console.log("✓ user_cloud_accounts");

  await sql`
    CREATE TABLE IF NOT EXISTS master_templates (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      product_id UUID NOT NULL REFERENCES products(id),
      provider VARCHAR(20) NOT NULL,
      file_id VARCHAR(255) NOT NULL,
      file_url TEXT,
      tracker_type VARCHAR(50) NOT NULL,
      version VARCHAR(20) DEFAULT '1.0',
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(product_id, provider)
    )
  `;
  console.log("✓ master_templates");

  await sql`
    CREATE TABLE IF NOT EXISTS user_trackers (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
      product_id UUID NOT NULL REFERENCES products(id),
      cloud_account_id UUID NOT NULL REFERENCES user_cloud_accounts(id),
      file_id VARCHAR(255) NOT NULL,
      file_url TEXT,
      tracker_type VARCHAR(50) NOT NULL,
      is_active BOOLEAN DEFAULT true,
      last_synced_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(user_id, product_id, cloud_account_id)
    )
  `;
  console.log("✓ user_trackers");

  await sql`
    CREATE TABLE IF NOT EXISTS sync_logs (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_tracker_id UUID NOT NULL REFERENCES user_trackers(id) ON DELETE CASCADE,
      action VARCHAR(50) NOT NULL,
      data JSONB,
      error_message TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  console.log("✓ sync_logs");

  await sql`CREATE INDEX IF NOT EXISTS idx_user_cloud_accounts_user ON user_cloud_accounts(user_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_user_trackers_user ON user_trackers(user_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_sync_logs_tracker ON sync_logs(user_tracker_id)`;
  console.log("✓ indexes");

  console.log("\nMigration complete!");
}

run().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
