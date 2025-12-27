# Supabase Authentication Setup Guide

This application uses Supabase for authentication. Follow these steps to set up Supabase authentication for your project.

## Prerequisites

1. A Supabase account ([Sign up here](https://supabase.com/))
2. A Supabase project

## Step 1: Create a Supabase Project

1. Go to [Supabase Dashboard](https://app.supabase.com/)
2. Click "New Project"
3. Enter your project details:
   - **Project Name**: Choose a name (e.g., "Muzakkir")
   - **Database Password**: Create a strong password (save this!)
   - **Region**: Choose the closest region to your users
4. Wait for the project to be provisioned (takes 1-2 minutes)

## Step 2: Get Your API Keys

1. In your Supabase dashboard, go to **Settings** > **API**
2. You'll find two important values:
   - **Project URL**: Your unique Supabase URL
   - **Publishable key** (or "anon public" in older projects): Your public API key

⚠️ **IMPORTANT**: Use the **publishable key** (NOT the secret key!) - the secret key should never be used in the browser.

## Step 3: Configure Environment Variables

Create a `.env.local` file in the root of your project with the following variables:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key

# OR if you have an older Supabase project, use:
# NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Where to Find These Values:

- **NEXT_PUBLIC_SUPABASE_URL**: Found in Settings > API > Project URL
- **NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY**: Found in Settings > API > Project API keys > "publishable key" (or "anon public" in older projects)

### New vs Old Naming:

Supabase updated their key naming:

- **New**: "publishable key" and "secret key"
- **Old**: "anon public" and "service_role"

Both naming conventions work with this setup!

## Step 4: Enable Authentication Providers

### Email/Password Authentication

Email/Password authentication is enabled by default in Supabase.

To configure email settings:

1. Go to **Authentication** > **Providers** > **Email**
2. Configure options:
   - **Enable email provider**: ON
   - **Confirm email**: Optional (recommended for production)
   - **Secure email change**: ON (recommended)

### Google OAuth Authentication

1. Go to **Authentication** > **Providers** > **Google**
2. Enable the Google provider
3. You'll need to set up a Google OAuth application:

#### Creating Google OAuth Credentials:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to **APIs & Services** > **Credentials**
4. Click **Create Credentials** > **OAuth 2.0 Client ID**
5. Configure the OAuth consent screen if prompted
6. Select **Web application** as the application type
7. Add authorized redirect URIs:
   ```
   https://your-project-ref.supabase.co/auth/v1/callback
   ```
   (Replace `your-project-ref` with your actual Supabase project reference)
8. Copy the **Client ID** and **Client Secret**
9. Paste them into your Supabase Google provider settings

## Step 5: Configure Row Level Security (RLS) for Database Access

**IMPORTANT**: Your database tables need RLS policies to allow the publishable key to read data.

### Quick Setup (Copy & Paste):

1. In your Supabase dashboard, go to **SQL Editor**
2. Click **New Query**
3. Copy and paste the contents of `SUPABASE_RLS_SETUP.sql` (in your project root)
4. Click **Run** or press `Cmd/Ctrl + Enter`

### What This Does:

This sets up policies to allow public **read-only** access to your tables:
- `books` - Book information
- `chapters` - Chapter data
- `paragraphs` - Paragraph content
- `dictionary` - Dictionary entries
- `documents` - Vector search data

### Manual Setup (Alternative):

If you prefer to do it manually, run this for each table:

```sql
-- Example for the 'books' table:
ALTER TABLE books ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to books"
ON books FOR SELECT TO anon USING (true);
```

Repeat for all tables: `books`, `chapters`, `paragraphs`, `dictionary`, `documents`.

### Verify It's Working:

After setting up RLS, test by running this query in SQL Editor:

```sql
SELECT COUNT(*) FROM books;
```

If you see a number (not an error), RLS is working! ✅

## Step 6: Configure Site URL and Redirect URLs

1. Go to **Authentication** > **URL Configuration**
2. Set your **Site URL** to:
   - Development: `http://localhost:3000`
   - Production: Your production domain (e.g., `https://yourapp.com`)
3. Add **Redirect URLs**:
   - Development: `http://localhost:3000/auth/callback`
   - Production: `https://yourapp.com/auth/callback`

## Step 7: Update .gitignore

Make sure your `.gitignore` file includes:

```
.env.local
.env*.local
```

**⚠️ IMPORTANT:** Never commit your `.env.local` file to version control!

## Step 8: Restart Development Server

After setting up your environment variables, restart your development server:

```bash
npm run dev
```

## Authentication Features

The application includes:

### ✅ Email/Password Authentication

- User registration with full name
- Email and password login
- Form validation
- Error handling with user-friendly messages
- Password confirmation

### ✅ Google OAuth Authentication

- One-click Google sign-in
- Automatic user profile creation
- OAuth callback handling

### ✅ Protected Routes

- Routes in `(protected)` folder require authentication
- Automatic redirect to sign-in page for unauthenticated users
- Loading states during auth checks

### ✅ User Management

- User dropdown menu with name/email display
- Sign-out functionality
- Persistent authentication state
- Session management

## File Structure

```
src/
├── lib/
│   └── supabase/
│       ├── config.ts              # Supabase initialization
│       ├── auth-service.ts        # Authentication service layer
│       ├── auth-context.tsx       # React context for auth state
│       └── index.ts               # Public exports
├── app/
│   ├── auth/
│   │   └── callback/
│   │       └── route.ts           # OAuth callback handler
│   ├── (protected)/
│   │   └── layout.tsx            # Protected route wrapper
│   ├── signin/
│   │   └── page.tsx              # Sign-in page
│   ├── signup/
│   │   └── page.tsx              # Sign-up page
│   └── layout.tsx                # Root layout with AuthProvider
```

## Code Architecture Principles

The implementation follows clean code principles:

### 1. Separation of Concerns

- Config, service, and UI layers are separate
- Each module has a single responsibility
- Clear boundaries between layers

### 2. Type Safety

- TypeScript interfaces for all data structures
- Proper error typing and handling
- Type-safe Supabase client usage

### 3. Reusability

- Service functions can be used anywhere
- Custom hooks for accessing auth state
- Shared error handling logic

### 4. Error Handling

- User-friendly error messages
- Comprehensive error mapping
- Proper error boundaries

### 5. Security

- Environment variables for sensitive data
- Row Level Security (RLS) in Supabase
- Secure session management

## Database Setup (Optional)

If you want to store additional user data:

### Creating a User Profiles Table

```sql
-- Create profiles table
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  full_name text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table public.profiles enable row level security;

-- Create policy to allow users to read their own profile
create policy "Users can view their own profile"
  on profiles for select
  using (auth.uid() = id);

-- Create policy to allow users to update their own profile
create policy "Users can update their own profile"
  on profiles for update
  using (auth.uid() = id);

-- Create function to handle new user creation
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name'
  );
  return new;
end;
$$ language plpgsql security definer;

-- Create trigger for new user signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```

Run this SQL in the Supabase SQL Editor (Dashboard > SQL Editor).

## Testing Your Setup

1. Start your development server: `npm run dev`
2. Navigate to `/signup`
3. Create a new account with email/password
4. Try signing in with Google
5. Verify you can access protected routes
6. Test the sign-out functionality
7. Check the Supabase dashboard to see your users

## Troubleshooting

### "Missing Supabase environment variables" error

- Check that both `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set in `.env.local`
- Restart your development server after adding variables
- Ensure there are no extra spaces in the `.env.local` file

### Email confirmation not working

- Check your **Authentication** > **Email Templates** settings
- For development, you can disable email confirmation in **Authentication** > **Providers** > **Email**
- Check your spam folder for confirmation emails

### Google Sign-In not working

- Verify your OAuth credentials are correct in Supabase
- Check that redirect URLs are properly configured in both Google Console and Supabase
- Make sure the Google provider is enabled in Supabase

### "Invalid redirect URL" error

- Add your callback URL to the Supabase dashboard: **Authentication** > **URL Configuration** > **Redirect URLs**
- Format should be: `http://localhost:3000/auth/callback` for development

### Users not being created

- Check the Auth logs in Supabase dashboard: **Authentication** > **Logs**
- Verify network requests in browser DevTools
- Check for any RLS policy issues if using custom tables

### Database queries returning empty or errors

- **Most common issue**: RLS (Row Level Security) is not configured
- Solution: Run the SQL commands in `SUPABASE_RLS_SETUP.sql`
- Check RLS policies in **Database** > **Tables** > Select table > **RLS Policies**
- Ensure policies allow `SELECT` access to the `anon` role

### "403 Forbidden" or "permission denied" errors

- This means RLS is blocking access
- Run the RLS setup SQL (see Step 5 above)
- Verify policies exist in SQL Editor: `SELECT * FROM pg_policies WHERE schemaname = 'public';`

## Security Best Practices

### 1. Row Level Security (RLS)

Always enable RLS on your database tables:

```sql
alter table your_table enable row level security;
```

### 2. Environment Variables

- Never commit `.env.local` to version control
- Use different Supabase projects for development and production
- Rotate keys if they're ever exposed

### 3. Email Verification

- Enable email verification in production
- Configure email templates in Supabase dashboard
- Use a custom SMTP provider for better deliverability

### 4. Rate Limiting

Supabase has built-in rate limiting, but consider:

- Implementing client-side rate limiting
- Adding CAPTCHA for signup forms
- Monitoring auth attempts in Supabase logs

## Production Checklist

Before deploying to production:

- [ ] Enable email confirmation
- [ ] Set up custom email templates
- [ ] Configure production site URL and redirect URLs
- [ ] Set up proper error logging
- [ ] Enable email notifications for auth events
- [ ] Review and test all RLS policies
- [ ] Set up database backups
- [ ] Configure proper CORS settings
- [ ] Test all authentication flows
- [ ] Set up monitoring and alerts

## Next Steps

Consider implementing:

- [ ] Password reset functionality (already in service layer)
- [ ] Email verification reminder
- [ ] User profile management page
- [ ] Social authentication (GitHub, Facebook, etc.)
- [ ] Two-factor authentication
- [ ] Session management UI
- [ ] Account deletion

## Support

For more information, visit:

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Next.js Documentation](https://nextjs.org/docs)

## Common Issues and Solutions

### Issue: "Auth session missing!" error

**Solution**: This usually means the user's session has expired. The auth context will automatically handle this and redirect to the sign-in page.

### Issue: OAuth popup blocked

**Solution**: Ensure popups are allowed in the browser. Alternatively, use redirect-based OAuth instead of popup.

### Issue: Slow authentication on first load

**Solution**: This is normal as Supabase checks for an existing session. The loading state in the UI handles this gracefully.

### Issue: User data not showing after signup

**Solution**: Check that the `user_metadata` is properly set during signup. The full name is stored in `raw_user_meta_data.full_name`.

## Additional Resources

- [Supabase Auth Helpers](https://supabase.com/docs/guides/auth/auth-helpers/nextjs)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Email Templates](https://supabase.com/docs/guides/auth/auth-email-templates)
- [OAuth Providers](https://supabase.com/docs/guides/auth/social-login)
