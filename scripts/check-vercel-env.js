#!/usr/bin/env node

console.log('🔍 Environment Variables Check for Vercel Deployment');
console.log('==================================================');

console.log('\n📋 Required Environment Variables:');
console.log('');

// Server-side variables (for middleware)
console.log('🔒 Server-side (for middleware):');
console.log('  ALLOWED_EMAIL_1=walterallred@gmail.com');
console.log('  ALLOWED_EMAIL_2=joshuavoiles@gmail.com');

// Client-side variables (for callback page)
console.log('');
console.log('🌐 Client-side (for callback page):');
console.log('  NEXT_PUBLIC_ALLOWED_EMAIL_1=walterallred@gmail.com');
console.log('  NEXT_PUBLIC_ALLOWED_EMAIL_2=joshuavoiles@gmail.com');

// Supabase variables
console.log('');
console.log('🗄️ Supabase (already configured):');
console.log('  NEXT_PUBLIC_SUPABASE_URL=https://hzyhjsszdhvbcgvaapwa.supabase.co');
console.log('  NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>');
console.log('  DATABASE_URL=<your-database-url>');

console.log('');
console.log('⚠️  IMPORTANT: You need BOTH server-side AND client-side email variables!');
console.log('   - Server-side (ALLOWED_EMAIL_*) for middleware route protection');
console.log('   - Client-side (NEXT_PUBLIC_ALLOWED_EMAIL_*) for callback validation');
console.log('');
console.log('🚀 After adding all variables to Vercel, redeploy your app.'); 