#!/usr/bin/env node

console.log('🔍 MasterThreader Auth Flow Test');
console.log('=================================');

// Test environment variables
console.log('\n📋 Environment Variables:');
console.log('  NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Missing');
console.log('  NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing');
console.log('  DATABASE_URL:', process.env.DATABASE_URL ? '✅ Set' : '❌ Missing');
console.log('  ALLOWED_EMAIL_1:', process.env.ALLOWED_EMAIL_1 ? '✅ Set' : '❌ Missing');
console.log('  ALLOWED_EMAIL_2:', process.env.ALLOWED_EMAIL_2 ? '✅ Set' : '❌ Missing');
console.log('  NEXT_PUBLIC_ALLOWED_EMAIL_1:', process.env.NEXT_PUBLIC_ALLOWED_EMAIL_1 ? '✅ Set' : '❌ Missing');
console.log('  NEXT_PUBLIC_ALLOWED_EMAIL_2:', process.env.NEXT_PUBLIC_ALLOWED_EMAIL_2 ? '✅ Set' : '❌ Missing');

console.log('\n🔄 Expected Auth Flow:');
console.log('1. User visits https://masterthreader.vercel.app/');
console.log('2. Middleware checks auth → redirects to /auth/login');
console.log('3. User enters email → magic link sent');
console.log('4. User clicks magic link → redirects to /auth/callback?code=...');
console.log('5. Callback page exchanges code for session');
console.log('6. Email validation against allowed list');
console.log('7. Redirect to main app');

console.log('\n🐛 Common Issues:');
console.log('• "No authentication tokens found" → Fixed with PKCE flow');
console.log('• "Email not authorized" → Check environment variables');
console.log('• Redirect loop → Check middleware logic');
console.log('• Session not persisting → Check Supabase config');

console.log('\n🔧 Debug Steps:');
console.log('1. Check browser console for "🔍 Callback URL Debug" logs');
console.log('2. Check browser console for "🔍 Auth Callback Debug" logs');
console.log('3. Check Vercel function logs for middleware debug');
console.log('4. Verify magic link URL format');

console.log('\n✅ Recent Fixes Applied:');
console.log('• Updated callback to use PKCE flow (exchangeCodeForSession)');
console.log('• Added proper URL parameter parsing');
console.log('• Enhanced debug logging');
console.log('• Fixed environment variable access');

console.log('\n🚀 Next Steps:');
console.log('1. Deploy updated code to Vercel');
console.log('2. Test magic link flow');
console.log('3. Check browser console for debug info');
console.log('4. Remove debug logging once working'); 