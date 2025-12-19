# Saele MVP - Guest Management Platform

A modern, full-stack web application for managing guest bookings and experiences, built with Next.js, Supabase, and TypeScript.

## 🚀 Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **Database & Auth:** Supabase (PostgreSQL + Auth)
- **Email Service:** Resend (optional)
- **Analytics:** PostHog (optional)
- **Package Manager:** pnpm

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 20+ 
- **pnpm** (Install with: `npm install -g pnpm`)
- **Docker** (for running Supabase locally)
- **Supabase CLI** (Install with: `brew install supabase/tap/supabase` on macOS)

## 🛠️ Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd saele
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Environment Setup

Copy the example environment file and fill in your values:

```bash
cp .env.local.example .env.local
```

**Required Environment Variables:**

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Resend Email Service (Optional)
RESEND_API_KEY=re_xxxxxxxxxxxxx
EMAIL_FROM=noreply@saele.com

# PostHog Analytics (Optional)
NEXT_PUBLIC_POSTHOG_KEY=phc_xxxxxxxxxxxxx
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
NEXT_PUBLIC_POSTHOG_ENABLED=true

# Application URLs
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Start Supabase Locally

```bash
pnpm run db:start
```

This will start a local Supabase instance using Docker. The first run may take a few minutes to download Docker images.

### 5. Apply Database Migrations

```bash
pnpm run db:reset
```

This command resets the database and applies all migrations, including the schema and RLS policies.

### 6. Generate TypeScript Types

```bash
pnpm run types:gen
```

This generates TypeScript types from your Supabase schema into `lib/supabase/database.types.ts`.

### 7. Start the Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to see your application.

## 📁 Project Structure

```
saele/
├── app/                        # Next.js App Router
│   ├── (public)/              # Public routes (no auth required)
│   │   ├── login/             # Magic link login page
│   │   └── auth/callback/     # Auth callback handler
│   ├── (protected)/           # Protected routes (auth required)
│   │   ├── admin/             # Admin-only pages
│   │   └── dashboard/         # User dashboard
│   ├── globals.css            # Global styles and design tokens
│   └── layout.tsx             # Root layout with providers
├── lib/                       # Core utilities and integrations
│   ├── auth/                  # Authentication helpers
│   │   ├── session.ts         # Server-side session management
│   │   └── client.ts          # Client-side auth helpers
│   ├── supabase/              # Supabase clients
│   │   ├── client.ts          # Browser client
│   │   ├── server.ts          # Server client
│   │   └── database.types.ts  # Generated DB types
│   ├── notifications/         # Email & notification services
│   │   └── email.ts           # Resend email abstraction
│   └── analytics/             # Analytics integration
│       └── posthog.tsx        # PostHog provider
├── components/                # React components
│   ├── ui/                    # Reusable UI components
│   └── auth/                  # Auth-specific components
├── types/                     # TypeScript type definitions
│   └── index.ts               # Shared types and type guards
├── supabase/                  # Supabase configuration
│   ├── migrations/            # Database migrations
│   └── seed.sql               # Seed data for development
├── middleware.ts              # Next.js middleware (auth & routing)
└── package.json               # Dependencies and scripts
```

## 🔐 Authentication

The application uses **Supabase Auth** with passwordless magic link authentication:

### User Flow

1. User enters email on `/login`
2. Magic link is sent to their email
3. Clicking the link authenticates and redirects to `/dashboard`
4. **Profile is automatically created** with default `guest` role (via database trigger)
5. Protected routes automatically redirect unauthenticated users to `/login`

### Automatic Profile Creation

Profile creation is automatic but uses different mechanisms based on environment:

**Production/Hosted Supabase:**
- Profile created in auth callback ([`app/(public)/auth/callback/route.ts`](app/(public)/auth/callback/route.ts))
- Application checks if profile exists and creates it with `role='guest'` if missing

**Local Development:**
- Can use database trigger on `auth.users` (included in migrations)
- Fallback to application-level creation if trigger not configured

**Key Features:**
- ✅ No manual profile creation required in either environment
- ✅ Every user automatically gets a `guest` profile
- ✅ Idempotent - safe to run multiple times
- ✅ Admins can promote users by updating the `role` column

**Why Two Approaches?**
Hosted Supabase restricts direct triggers on `auth.users` for security. The application-level approach provides the same functionality while respecting these security boundaries.

See the "Profile Creation Flow" section in [`SCHEMA.md`](./SCHEMA.md#profile-creation-flow) for detailed diagrams.

### Role-Based Access Control

Two user roles are supported:

- **Guest** (`guest`): Default role for all new users, can view own bookings and profile
- **Admin** (`admin`): Full access to all data and admin panel

Role is stored in the `profiles.role` column and enforced via:
- Row Level Security (RLS) policies in the database
- Server-side route protection with `requireAdmin()` and `requireAuth()`
- Helper functions like `isAdmin()` for programmatic checks

**Security guarantees:**
- Guest users **cannot** escalate privileges to admin
- Guest users **cannot** view other users' data
- All access control is enforced at the database level via RLS

## 📊 Database Management

### Available Commands

```bash
# Start local Supabase instance
pnpm run db:start

# Stop local Supabase instance
pnpm run db:stop

# Reset database (apply all migrations)
pnpm run db:reset

# Generate TypeScript types from schema
pnpm run types:gen
```

### Database Schema

See [`SCHEMA.md`](./SCHEMA.md) for detailed documentation of:
- Table structures and relationships
- Row Level Security (RLS) policies
- Database triggers (including automatic profile creation)
- Helper functions
- SQL testing scenarios
- Migration workflow

**Automated Testing:**
Run the RLS verification suite to test all security policies:
```bash
supabase db execute --file supabase/tests/verify-rls.sql
```

See [`supabase/tests/verify-rls.sql`](./supabase/tests/verify-rls.sql) for the complete test suite.

### Key Tables

- `profiles` - User profile data with roles
- `bookings` - Guest booking records
- `host_contacts` - Contact information for guests
- `notifications` - Email notification queue
- `event_logs` - Audit trail for system events

## 🎨 Design System

Tailwind CSS v4 with comprehensive design tokens defined in `app/globals.css`:

- **Colors:** Primary, secondary, accent, success, warning, error (50-950 shades)
- **Typography:** Font families, sizes, and weights
- **Spacing:** Consistent spacing scale
- **Borders:** Radius tokens (sm to 3xl)
- **Shadows:** Shadow system (sm to 2xl)
- **Easing:** Animation timing functions

Access design tokens in components:
```tsx
<div className="bg-primary-500 text-white rounded-lg p-4 shadow-lg">
  Content
</div>
```

## 📧 Email Integration

Email sending is abstracted through `lib/notifications/email.ts` using Resend:

```typescript
import { sendEmail, sendMagicLinkEmail } from '@/lib/notifications/email';

// Send custom email
await sendEmail({
  to: 'user@example.com',
  subject: 'Welcome',
  html: '<p>Hello!</p>',
});

// Send magic link (template included)
await sendMagicLinkEmail('user@example.com', magicLink);
```

**Set environment variables:**
- `RESEND_API_KEY` - Your Resend API key
- `EMAIL_FROM` - Sender email address

## 📬 Notification Pipeline

The application includes a production-ready notification pipeline for reliable email delivery with automatic retries and comprehensive monitoring.

### Features

- ✅ **Automatic Retry Logic** - Exponential backoff (60s, 5min) for transient failures
- ✅ **Queue Management** - PostgreSQL-based queue with pg_cron scheduling
- ✅ **Event Tracking** - Detailed event logs for every notification lifecycle
- ✅ **Admin Monitoring** - SQL views for real-time queue health and error analysis
- ✅ **Idempotent Delivery** - Prevents duplicate emails on retry
- ✅ **Secure Secrets** - API keys stored in Supabase Vault

### Architecture

The pipeline uses:
- **Database Queue** - `notifications` table with status tracking
- **Event Logs** - `notification_event_logs` for detailed audit trail
- **Edge Function** - Serverless processor (`process-notifications`)
- **pg_cron** - Automated scheduling (runs every minute)
- **Resend API** - Email delivery with error handling

### Usage

Queue notifications using the TypeScript helper:

```typescript
import { queueMagicLinkNotification, queueBookingConfirmation } from '@/lib/notifications/queue';

// Queue magic link email
await queueMagicLinkNotification(
  'user@example.com',
  'https://app.saele.com/auth/callback?token=...'
);

// Queue booking confirmation
await queueBookingConfirmation('guest@example.com', {
  id: booking.id,
  externalBookingId: 'BOOK-123',
  checkIn: '2024-12-25',
  checkOut: '2024-12-31',
});
```

### Monitoring

View queue health and metrics:

```sql
-- Dashboard overview
SELECT * FROM public.notifications_dashboard_view;

-- Queue status
SELECT * FROM public.notification_queue_status;

-- Failed notifications
SELECT * FROM public.failed_notifications_report;

-- Notification timeline
SELECT * FROM public.notification_processing_timeline
WHERE notification_id = '<id>';
```

### Documentation

- **[NOTIFICATION-TESTING.md](./NOTIFICATION-TESTING.md)** - Comprehensive testing guide
- **[DEPLOYMENT-NOTIFICATION-PIPELINE.md](./DEPLOYMENT-NOTIFICATION-PIPELINE.md)** - Deployment steps
- **[NOTIFICATION-MONITORING.md](./NOTIFICATION-MONITORING.md)** - Monitoring and alerting
- **[SECRETS-SETUP.md](./SECRETS-SETUP.md)** - Secrets configuration

### Setup

1. **Configure secrets:**
   ```bash
   supabase secrets set RESEND_API_KEY=re_xxxxxxxxxxxxx
   ```

2. **Apply migrations:**
   ```bash
   pnpm run db:reset
   ```

3. **Deploy Edge Function:**
   ```bash
   supabase functions deploy process-notifications
   ```

4. **Verify cron job:**
   ```sql
   SELECT * FROM cron.job WHERE jobname = 'process-notifications-every-minute';
   ```

## 📈 Analytics

PostHog analytics is integrated for event tracking and feature flags:

```typescript
import { analytics } from '@/lib/analytics/posthog';

// Track custom event
analytics.track('button_clicked', { button_id: 'signup' });

// Identify user
analytics.identify(user.id, {
  email: user.email,
  role: profile.role,
});

// Check feature flag
if (analytics.isFeatureEnabled('new-feature')) {
  // Show new feature
}
```

**Set environment variables:**
- `NEXT_PUBLIC_POSTHOG_KEY` - Your PostHog project key
- `NEXT_PUBLIC_POSTHOG_HOST` - PostHog host URL
- `NEXT_PUBLIC_POSTHOG_ENABLED` - Enable/disable analytics (true/false)

## 🧪 Development Workflow

### Linting

```bash
pnpm lint
```

### Testing

**Manual E2E Testing:**

Comprehensive role-based access control testing guide:
```bash
# See TESTING.md for step-by-step instructions
cat TESTING.md
```

Test scenarios include:
- Guest user signup and automatic profile creation
- Guest access restrictions (can only see own data)
- Admin full access (can see all data)
- Route protection and redirects
- Role immutability and security

See [`TESTING.md`](./TESTING.md) for complete testing guide.

**Automated SQL Testing:**

Run the RLS verification suite:
```bash
# Execute the test suite
supabase db execute --file supabase/tests/verify-rls.sql
```

This automatically tests:
- All RLS policies on all tables
- Helper functions like `is_admin()`
- Database triggers
- Role-based access restrictions

**Quick Test with Seed Data:**

```bash
# Reset database with seed data
pnpm run db:reset

# Test users are now available:
# - admin@saele.com (admin role)
# - guest1@saele.com (guest role)
# - guest2@saele.com (guest role)
```

### Building for Production

```bash
pnpm build
pnpm start
```

### Testing Auth

The database seed includes test users for development:

**Admin User:**
- Email: `admin@saele.com`
- Role: `admin`
- Access: Full access to admin panel and all data

**Guest Users:**
- Email: `guest1@saele.com`
- Email: `guest2@saele.com`
- Role: `guest`
- Access: Own bookings and profile only

**Testing Steps:**
1. Start local services: `pnpm run db:start && pnpm dev`
2. Navigate to http://localhost:3000/login
3. Enter one of the test emails above
4. Check http://127.0.0.1:54324 for the magic link (Inbucket)
5. Click the magic link to authenticate

**Verify Role-Based Access:**
- Guest users: Can access `/dashboard`, redirected from `/admin`
- Admin users: Can access both `/dashboard` and `/admin`

**For comprehensive testing guide, see [`TESTING.md`](./TESTING.md)**

## 🚢 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Configure environment variables
4. Deploy

### Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Run migrations: `supabase db push`
3. Update environment variables with production values

## 📖 Additional Resources

### Documentation
- **[SCHEMA.md](./SCHEMA.md)** - Database schema, RLS policies, and SQL testing
- **[TESTING.md](./TESTING.md)** - Manual testing guide for role-based access control
- **[supabase/tests/verify-rls.sql](./supabase/tests/verify-rls.sql)** - Automated RLS test suite

### External Documentation
- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Supabase RLS Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Tailwind CSS v4 Documentation](https://tailwindcss.com/docs)
- [Resend Documentation](https://resend.com/docs)
- [PostHog Documentation](https://posthog.com/docs)

## 🤝 Contributing

See [`SCHEMA.md`](./SCHEMA.md) for database architecture and migration guidelines.

For testing changes to authentication or authorization:
1. Run manual tests: See [`TESTING.md`](./TESTING.md)
2. Run automated SQL tests: `supabase db execute --file supabase/tests/verify-rls.sql`
3. Verify all tests pass before submitting PR

## 📄 License

[Your License Here]

---

**Built with ❤️ by the Saele Team**
