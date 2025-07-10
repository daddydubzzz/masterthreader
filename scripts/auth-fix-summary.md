# Auth Callback Fix Summary

## Problem
The error "invalid request: both auth code and code verifier should be non-empty" was occurring because we were trying to use `exchangeCodeForSession()` with a magic link that doesn't use PKCE.

## Root Cause
- Magic links sent via `signInWithOtp()` don't use PKCE by default
- We were trying to manually extract and exchange codes
- Supabase handles the session automatically for magic links

## Solution
**Changed the callback approach from manual code exchange to auth state listener:**

### Before (Broken):
```typescript
// Tried to manually extract code and exchange it
const code = url.searchParams.get('code')
const { data, error } = await supabase.auth.exchangeCodeForSession(code)
```

### After (Fixed):
```typescript
// Listen for Supabase's automatic auth state changes
supabase.auth.onAuthStateChange(async (event, session) => {
  if (event === 'SIGNED_IN' && session?.user) {
    // Handle successful authentication
  }
})
```

## Key Changes
1. **Removed manual code extraction** - Let Supabase handle it
2. **Added auth state listener** - Responds to SIGNED_IN events
3. **Kept email validation** - Still checks against allowed emails
4. **Added better error handling** - Handles URL errors and auth failures
5. **Maintained redirect flow** - Still redirects to main app after success

## Flow
1. User clicks magic link → `/auth/callback?code=...`
2. Supabase automatically processes the callback
3. Auth state changes to SIGNED_IN
4. Our listener validates the email
5. Redirects to main app

## Testing
Deploy this fix and test the magic link flow. The auth state change listener should properly handle the authentication without PKCE errors. 