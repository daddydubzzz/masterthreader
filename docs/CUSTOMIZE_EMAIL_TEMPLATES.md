# Customizing Supabase Email Templates

## Overview
The magic link emails are sent by Supabase using templates configured in your project dashboard, not by your application code.

## Steps to Customize Email Templates

### 1. Access Email Templates
1. Go to [Supabase Dashboard](https://supabase.com/dashboard/project/hzyhjsszdhvbcgvaapwa)
2. Navigate to **Authentication → Email Templates**
3. You'll see templates for different auth flows

### 2. Edit Magic Link Template
1. Click on **Magic Link** template
2. Customize the **Subject** and **Content**
3. Use these variables in your template:
   - `{{ .ConfirmationURL }}` - The magic link URL
   - `{{ .Token }}` - 6-digit OTP code (optional)
   - `{{ .SiteURL }}` - Your app's URL
   - `{{ .Email }}` - User's email address

### 3. Recommended Magic Link Template

**Subject:**
```
Your MasterThreader Login Link
```

**Content:**
```html
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="text-align: center; margin-bottom: 30px;">
    <h1 style="color: #1f2937; font-size: 24px; margin-bottom: 10px;">MasterThreader</h1>
    <p style="color: #6b7280; font-size: 16px;">AI-Powered Thread Generation</p>
  </div>
  
  <div style="background: #f9fafb; border-radius: 8px; padding: 30px; text-align: center;">
    <h2 style="color: #1f2937; font-size: 20px; margin-bottom: 20px;">Sign In to MasterThreader</h2>
    <p style="color: #4b5563; font-size: 16px; margin-bottom: 30px;">Click the button below to securely sign in to your account:</p>
    
    <a href="{{ .ConfirmationURL }}" style="display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: white; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 600; font-size: 16px;">
      Sign In to MasterThreader
    </a>
    
    <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
      This link will expire in 1 hour for security reasons.
    </p>
  </div>
  
  <div style="text-align: center; margin-top: 30px;">
    <p style="color: #9ca3af; font-size: 12px;">
      If you didn't request this email, you can safely ignore it.
    </p>
  </div>
</div>
```

### 4. Remove OTP Option (Optional)
If you don't want the OTP code option, simply don't include `{{ .Token }}` in your template.

### 5. Save Changes
Click **Save** to apply your custom template.

## Variables Available

| Variable | Description |
|----------|-------------|
| `{{ .ConfirmationURL }}` | The magic link URL that signs the user in |
| `{{ .Token }}` | 6-digit OTP code (alternative to magic link) |
| `{{ .TokenHash }}` | Hashed version of the token |
| `{{ .SiteURL }}` | Your application's site URL |
| `{{ .Email }}` | User's email address |
| `{{ .RedirectTo }}` | Redirect URL after authentication |

## Testing
1. Save your template
2. Go to **Authentication → Users** 
3. Click **Send Magic Link** to test
4. Check your email for the new template

## Advanced: Custom Email Service
For complete control over emails, you can:
1. Disable Supabase's built-in emails
2. Use Auth Hooks to send emails via your own service (Resend, SendGrid, etc.)
3. Create custom React Email templates

This requires more setup but gives you full control over the email design and sending process. 