# Nichu Store - Project Architecture

## Overview

Nichu Store is a full-stack e-commerce application built with Next.js 15, featuring fitness products, secure authentication, payment processing, and admin management capabilities.

## Tech Stack

### Frontend
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Custom components with Radix UI primitives
- **State Management**: React Context API

### Backend
- **Database**: Neon (Serverless PostgreSQL)
- **ORM**: Drizzle ORM
- **Authentication**: Neon Auth (Better Auth)
- **File Storage**: Vercel Blob
- **Payment Gateway**: Razorpay

### Infrastructure
- **Hosting**: Netlify (configured via `netlify.toml`)
- **Database**: Neon Serverless PostgreSQL
- **CDN/Storage**: Vercel Blob

## Architecture Layers

### 1. Data Layer

#### Database Schema (`src/lib/db/schema.ts`)
- **profiles** - User profile information
- **products** - Product catalog
- **orders** - Order records
- **orderItems** - Order line items
- **cartItems** - Shopping cart items
- **offerCodes** - Promotional codes
- **offerCodeUsage** - Offer code redemption tracking

#### Database Client (`src/lib/db/index.ts`)
- Neon serverless driver via `@neondatabase/serverless`
- Drizzle ORM with proxy pattern for lazy initialization
- Connection pooling optimized for serverless

### 2. Authentication Layer

#### Server Auth (`src/lib/auth.ts`)
- Neon Auth server instance
- Helper functions:
  - `getAuthUserId()` - Get current user ID
  - `requireAuth()` - Enforce authentication
  - `isAdmin()` - Check admin privileges
  - `syncProfile()` - Sync user profile with auth

#### Client Auth (`src/lib/auth/client.ts`)
- Neon Auth client instance
- React hooks for session management

#### Middleware (`src/middleware.ts`)
- Route protection for:
  - `/cart` - Authenticated users only
  - `/orders` - Authenticated users only
  - `/admin` - Admin users only
  - `/account` - Authenticated users only

### 3. Application Layer

#### Context Providers

**AuthContext** (`src/contexts/AuthContext.tsx`)
- Session management via `authClient.useSession()`
- User state: `user`, `loading`, `avatarUrl`, `isAdmin`
- Sign-out functionality

**ProductContext** (`src/contexts/ProductContext.tsx`)
- Product catalog management
- Product filtering and search

**CartContext** (`src/contexts/CartContext.tsx`)
- Shopping cart state
- Cart operations via API routes
- No direct database access from client

#### Component Structure

```
src/components/
├── auth/          # Authentication UI components
├── home/          # Homepage components
├── landing/       # Landing page components
└── [other]/       # Additional feature components
```

### 4. API Layer

All API routes use Neon Auth + Drizzle ORM:

#### Public APIs
- `GET /api/products` - Product listing
- `POST /api/offer-codes/validate` - Validate promotional codes

#### Authenticated APIs
- `GET /api/cart` - Get cart items
- `POST /api/cart` - Add to cart
- `DELETE /api/cart` - Remove from cart
- `GET /api/orders` - List user orders
- `POST /api/orders/create` - Create new order
- `POST /api/orders/verify` - Verify Razorpay payment
- `GET /api/downloads` - Secure file downloads (Vercel Blob)

#### Admin APIs
- `GET /api/admin/stats` - Dashboard statistics
- `GET /api/admin/products` - List products
- `POST /api/admin/products` - Create product
- `PATCH /api/admin/products` - Update product
- `DELETE /api/admin/products` - Delete product
- `GET /api/admin/orders` - List all orders
- `PATCH /api/admin/orders` - Update order status
- `GET /api/admin/users` - List users
- `GET /api/admin/offer-codes` - List offer codes
- `POST /api/admin/offer-codes` - Create offer code
- `PATCH /api/admin/offer-codes` - Update offer code
- `DELETE /api/admin/offer-codes` - Delete offer code
- `POST /api/admin/upload` - Upload files to Vercel Blob

### 5. Routing Structure

```
src/app/
├── page.tsx                    # Homepage
├── layout.tsx                  # Root layout with providers
├── globals.css                 # Global styles
├── account/                    # User account management
│   ├── settings/              # Profile settings
│   └── security/              # Security settings
├── admin/                      # Admin dashboard
│   ├── dashboard/             # Analytics & stats
│   ├── products/              # Product management
│   ├── orders/                # Order management
│   ├── users/                 # User management
│   └── offer-codes/           # Promotional code management
├── api/                        # API routes (see API Layer)
├── auth/                       # Authentication pages
│   ├── sign-in/               # Sign in page
│   └── sign-up/               # Sign up page
├── cart/                       # Shopping cart
├── checkout/                   # Checkout flow
├── orders/                     # Order history
├── products/                   # Product catalog
└── [other routes]/            # Additional pages
```

## Data Flow

### Authentication Flow
1. User visits `/auth/sign-in` or `/auth/sign-up`
2. Neon Auth UI components handle authentication
3. Session created and stored in secure HTTP-only cookies
4. Middleware validates session on protected routes
5. AuthContext provides session state to components
6. Profile synced with database via `syncProfile()`

### Shopping Flow
1. User browses products (public)
2. Add to cart → `POST /api/cart` (requires auth)
3. View cart → `GET /api/cart`
4. Proceed to checkout → `/checkout`
5. Apply offer code → `POST /api/offer-codes/validate`
6. Create order → `POST /api/orders/create`
7. Razorpay payment gateway integration
8. Verify payment → `POST /api/orders/verify`
9. Order confirmation and digital product delivery

### Admin Flow
1. Admin logs in with admin privileges
2. Access `/admin` routes (protected by middleware)
3. Manage products, orders, users, and offer codes
4. Upload product files to Vercel Blob
5. View analytics and statistics

## Security

### Authentication
- Secure HTTP-only cookies
- CSRF protection via Neon Auth
- Session validation on every request
- Password hashing (handled by Neon Auth)

### Authorization
- Role-based access control (admin flag in profiles)
- Middleware-level route protection
- API-level permission checks
- User-scoped data access

### Data Protection
- Environment variables for sensitive data
- Secure file URLs with expiration (Vercel Blob)
- SQL injection prevention (Drizzle ORM)
- Input validation on API routes

## Environment Variables

### Required
```env
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
```

## Configuration Files

- `next.config.ts` - Next.js configuration
- `drizzle.config.ts` - Drizzle ORM configuration
- `netlify.toml` - Netlify deployment settings
- `tsconfig.json` - TypeScript configuration
- `postcss.config.mjs` - PostCSS configuration
- `package.json` - Dependencies and scripts

## Database Schema

See `neon-setup.sql` for complete schema definition including:
- Tables with relationships
- Indexes for performance
- Constraints and validations
- Default values

## Deployment

### Build Process
1. Install dependencies: `npm install`
2. Run database migrations: `npm run db:push`
3. Build application: `npm run build`
4. Deploy to Netlify (automatic via Git integration)

### Environment Setup
1. Create Neon database
2. Run `neon-setup.sql` schema
3. Configure environment variables
4. Set up Vercel Blob storage
5. Configure Razorpay account

## Development Workflow

### Local Development
```bash
npm install          # Install dependencies
npm run dev          # Start dev server
npm run db:push      # Push schema changes
npm run db:studio    # Open Drizzle Studio
```

### Code Organization Principles
- **Separation of Concerns**: Clear boundaries between layers
- **Type Safety**: Full TypeScript coverage
- **Server/Client Split**: Explicit server/client component separation
- **API-First**: Client components use API routes, not direct DB access
- **Reusable Components**: Shared UI components
- **Context for State**: React Context for global state management

## Performance Optimizations

- **Serverless Database**: Neon auto-scaling
- **Edge Middleware**: Fast route protection
- **Static Generation**: Pre-rendered pages where possible
- **Lazy Loading**: Code splitting and dynamic imports
- **Optimized Images**: Next.js Image component
- **CDN Delivery**: Vercel Blob for static assets

## Monitoring & Logging

- Server-side error logging
- API request/response logging
- Payment transaction logging
- Admin action audit trail

## Future Enhancements

- Real-time inventory management
- Email notifications
- Advanced analytics dashboard
- Multi-currency support
- Wishlist functionality
- Product reviews and ratings
- Advanced search and filtering
- Mobile app (React Native)

---

**Last Updated**: March 2026  
**Version**: 1.0.0
