# Database Setup Guide

This guide explains how to set up the Neon PostgreSQL database for the Pick Your Battles application.

## Prerequisites

- Node.js 22.x or later
- npm
- Neon account (free tier available at https://neon.tech)

## Step 1: Create Neon Database

1. Sign up or log in to Neon at https://neon.tech
2. Click "Create Project"
3. Name your project: `pick-your-battles`
4. Select a region close to your users
5. Click "Create Project"

## Step 2: Get Connection String

1. In your Neon project dashboard, click "Connection Details"
2. Copy the connection string (it should look like):
   ```
   postgresql://[user]:[password]@[host]/[database]?sslmode=require
   ```
3. Save this for the next step

## Step 3: Configure Environment Variables

1. Navigate to the `app/` directory
2. Copy `.env.local.example` to `.env.local`:
   ```bash
   cd app
   cp .env.local.example .env.local
   ```
3. Edit `.env.local` and add your database connection string:
   ```env
   DATABASE_URL=postgresql://[user]:[password]@[host]/[database]?sslmode=require
   AUTH_SECRET=your-auth-secret-here
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   ```

## Step 4: Generate and Run Migrations

1. Generate migration files from the schema:
   ```bash
   npm run db:generate
   ```

   This creates SQL migration files in `app/lib/db/migrations/`

2. Run the migrations to create tables:
   ```bash
   npm run db:migrate
   ```

   This will create the `users` and `tasks` tables in your Neon database

## Step 5: Verify Database Setup

1. Log in to Neon dashboard
2. Go to your project
3. Click "SQL Editor"
4. Run the following queries to verify tables exist:

   ```sql
   -- Check users table
   SELECT * FROM users;

   -- Check tasks table
   SELECT * FROM tasks;
   ```

Both queries should return empty results (no rows yet), but should not error.

## Step 6: Start the Application

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Open http://localhost:3000

3. Sign in with Google OAuth

4. Your user should be automatically synced to the database

5. Verify in Neon SQL Editor:
   ```sql
   SELECT * FROM users;
   ```

   You should see your user record.

## Database Schema

### Users Table

| Column | Type | Description |
|--------|------|-------------|
| id | text (PK) | User ID from Auth.js |
| email | text (unique) | User email address |
| name | text | User display name |
| image | text | Profile picture URL |
| created_at | timestamp | When user was created |

### Tasks Table

| Column | Type | Description |
|--------|------|-------------|
| id | serial (PK) | Auto-incrementing task ID |
| user_id | text (FK) | References users.id |
| title | text | Task title |
| description | text | Task description (optional) |
| status | text | 'pending', 'in-progress', or 'completed' |
| position | integer | Task position (1, 2, or 3) |
| created_at | timestamp | When task was created |
| updated_at | timestamp | When task was last updated |

## Available Database Scripts

| Command | Description |
|---------|-------------|
| `npm run db:generate` | Generate migration files from schema |
| `npm run db:migrate` | Run pending migrations |
| `npm run db:studio` | Open Drizzle Studio (database GUI) |

## Troubleshooting

### "DATABASE_URL environment variable is not set"

- Ensure `.env.local` exists in the `app/` directory
- Verify the `DATABASE_URL` is set correctly
- Restart your development server

### "Connection refused" or "Connection timeout"

- Check your Neon project is active (not suspended)
- Verify the connection string is correct
- Check your network allows connections to Neon (firewall/VPN)

### "relation does not exist"

- You likely haven't run migrations yet
- Run `npm run db:migrate` to create the tables

### "Task limit reached" when creating tasks

- This is expected behavior! You can only have 3 tasks at a time
- Complete or delete an existing task to make room for a new one

## Production Deployment

When deploying to Vercel:

1. Add `DATABASE_URL` to Vercel environment variables:
   - Go to your Vercel project settings
   - Navigate to "Environment Variables"
   - Add `DATABASE_URL` with your Neon connection string
   - Also add `AUTH_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`

2. Run migrations in production:
   - Deploy your app first
   - Run migrations via Vercel CLI or manually via Neon SQL Editor

3. Neon will automatically handle connection pooling and scaling

## Security Notes

- Never commit `.env.local` to git
- `.env.local` is already in `.gitignore`
- Use different databases for development and production
- Neon enforces SSL connections automatically
- All database queries are scoped to the authenticated user

## Next Steps

After setting up the database:
1. Create some tasks via the UI
2. Verify they persist across page reloads
3. Test the 3-task limit by trying to create a 4th task
4. Test task updates and deletions
