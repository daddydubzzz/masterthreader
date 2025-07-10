# Authentication Setup Guide

## Overview

MasterThreader uses Supabase Magic Links for secure authentication with email-based access control. This integrates with your existing Supabase project that's already storing vector embeddings and triples.

## 🚀 Quick Setup

### 1. Use Your Existing Supabase Project

Since you already have a Supabase project for vector storage, we'll enable authentication on the same project:
- No need to create a new project
- Authentication will use the same database as your vector storage
- Seamless integration with existing infrastructure

### 2. Configure Authentication

1. In your existing Supabase dashboard, go to **Authentication > Settings**
2. Enable **Email** provider (if not already enabled)
3. Disable **Confirm email** (we'll use magic links)
4. Set **Site URL** to your production domain: `https://masterthreader.vercel.app`
5. Add **Redirect URLs**:
   - `https://masterthreader.vercel.app/auth/callback`
   - `http://localhost:3000/auth/callback` (for development)

### 3. Use Your Existing API Keys

Since you already have Supabase configured for vector storage:
1. Your **Project URL** and **anon public** key are already in use
2. These same credentials will work for authentication
3. No additional API keys needed - perfect integration!

### 4. Environment Variables

Add these authentication variables to your existing `.env.local` file:

```bash
# Supabase Configuration (use your existing values)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-existing-anon-key

# Authentication - Allowed Email Addresses
ALLOWED_EMAIL_1=your-email@example.com
ALLOWED_EMAIL_2=josh-email@example.com

# Public Environment Variables (for client-side validation)
NEXT_PUBLIC_ALLOWED_EMAIL_1=your-email@example.com
NEXT_PUBLIC_ALLOWED_EMAIL_2=josh-email@example.com
```

**Note**: You should already have `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` from your vector database setup. Just add the email authentication variables.

### 5. Deploy to Vercel

1. Add the environment variables to your Vercel project:
   - Go to your Vercel project settings
   - Navigate to **Environment Variables**
   - Add all the Supabase and email variables

2. Redeploy your application

## 🔐 How Authentication Works

### Magic Link Flow

1. User enters their email on `/auth/login`
2. System checks if email is in the allowed list
3. If allowed, Supabase sends a magic link to their email
4. User clicks the magic link
5. They're redirected to `/auth/callback` for verification
6. If successful, they're logged in and redirected to the main app

### Access Control

- **Email Whitelist**: Only emails in `ALLOWED_EMAIL_1` and `ALLOWED_EMAIL_2` can access the app
- **Middleware Protection**: All routes except `/auth/*` require authentication
- **Session Management**: Uses Supabase's secure session handling

## 🛠️ Development Setup

### Local Development

```bash
# 1. Install dependencies (already done)
npm install

# 2. Set up environment variables
cp env.example .env.local
# Edit .env.local with your Supabase credentials

# 3. Start development server
npm run dev

# 4. Visit http://localhost:3000
# You'll be redirected to /auth/login
```

### Testing Authentication

1. Go to `http://localhost:3000`
2. You should be redirected to `/auth/login`
3. Enter one of your allowed email addresses
4. Check your email for the magic link
5. Click the link to authenticate
6. You should be redirected to the main app

## 🔧 Configuration Options

### Adding More Users

To add more users, you can:

1. **Add more environment variables**:
   ```bash
   ALLOWED_EMAIL_3=another-user@example.com
   NEXT_PUBLIC_ALLOWED_EMAIL_3=another-user@example.com
   ```

2. **Update the code** in `src/lib/supabase.ts`:
   ```typescript
   export const ALLOWED_EMAILS = [
     process.env.ALLOWED_EMAIL_1,
     process.env.ALLOWED_EMAIL_2,
     process.env.ALLOWED_EMAIL_3, // Add this line
   ].filter(Boolean) as string[]
   ```

### Customizing Email Templates

1. In Supabase dashboard, go to **Authentication > Email Templates**
2. Customize the "Magic Link" template
3. You can add your branding and custom messaging

## 🚨 Security Considerations

### Environment Variables

- **Never commit** `.env.local` to version control
- **Use different keys** for development and production
- **Rotate keys regularly** for production environments

### Email Validation

- Emails are compared case-insensitively
- Only exact matches are allowed
- No wildcard or domain-based matching

### Session Security

- Sessions are managed by Supabase (secure by default)
- Automatic token refresh
- Secure cookie handling

## 🐛 Troubleshooting

### Common Issues

**1. "Email not authorized" Error**
- Check that the email is exactly matching the environment variable
- Verify case sensitivity (system converts to lowercase)
- Ensure environment variables are deployed to Vercel

**2. Magic Link Not Working**
- Check Supabase redirect URLs configuration
- Verify the magic link hasn't expired (default: 1 hour)
- Check spam folder

**3. Redirect Loop**
- Ensure Supabase credentials are correct
- Check that middleware is not blocking auth routes
- Verify environment variables are properly set

**4. Build Errors**
- Make sure environment variables are available during build
- Check that Supabase client initialization is conditional

### Debug Steps

1. **Check Environment Variables**:
   ```bash
   # In your terminal
   echo $NEXT_PUBLIC_SUPABASE_URL
   echo $NEXT_PUBLIC_SUPABASE_ANON_KEY
   ```

2. **Check Supabase Dashboard**:
   - Go to Authentication > Users
   - Verify users are being created when they request magic links

3. **Check Browser Console**:
   - Look for authentication errors
   - Verify network requests to Supabase

## 🔄 Maintenance

### Regular Tasks

- **Monitor user access** in Supabase dashboard
- **Review authentication logs** for any issues
- **Update allowed emails** as needed
- **Rotate API keys** periodically

### Backup Plan

- Keep a backup of your Supabase project settings
- Document all environment variables
- Test authentication flow regularly

---

**Your MasterThreader app is now secure and ready for production use!** 🎉

Only you and Josh will be able to access the application via magic link authentication. 