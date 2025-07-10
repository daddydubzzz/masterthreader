#!/usr/bin/env node

/**
 * Test script to check client-side environment variables
 * This simulates what the browser sees
 */

// Simulate browser environment (only NEXT_PUBLIC_ vars are available)
const clientEnv = {};
Object.keys(process.env).forEach(key => {
  if (key.startsWith('NEXT_PUBLIC_')) {
    clientEnv[key] = process.env[key];
  }
});

console.log('🌐 Client-side Environment Variables (what browser sees):\n');

console.log('Supabase Configuration:');
console.log('  NEXT_PUBLIC_SUPABASE_URL:', clientEnv.NEXT_PUBLIC_SUPABASE_URL || '❌ NOT SET');
console.log('  NEXT_PUBLIC_SUPABASE_ANON_KEY:', clientEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ SET' : '❌ NOT SET');

console.log('\nAllowed Emails:');
console.log('  NEXT_PUBLIC_ALLOWED_EMAIL_1:', clientEnv.NEXT_PUBLIC_ALLOWED_EMAIL_1 || '❌ NOT SET');
console.log('  NEXT_PUBLIC_ALLOWED_EMAIL_2:', clientEnv.NEXT_PUBLIC_ALLOWED_EMAIL_2 || '❌ NOT SET');

console.log('\nEmail validation test:');
const allowedEmails = [
  clientEnv.NEXT_PUBLIC_ALLOWED_EMAIL_1,
  clientEnv.NEXT_PUBLIC_ALLOWED_EMAIL_2,
].filter(Boolean);

console.log('  Allowed emails array:', allowedEmails);
console.log('  Test email "walterallred@gmail.com":', 
  allowedEmails.includes('walterallred@gmail.com') ? '✅ ALLOWED' : '❌ NOT ALLOWED'
);

if (allowedEmails.length === 0) {
  console.log('\n⚠️  WARNING: No allowed emails found in client environment!');
  console.log('   This means the browser cannot validate emails properly.');
  console.log('   Check that NEXT_PUBLIC_ALLOWED_EMAIL_* variables are set in Vercel.');
} 