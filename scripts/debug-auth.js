#!/usr/bin/env node

/**
 * Debug script to test Supabase authentication configuration
 * Run with: node scripts/debug-auth.js
 */

require('dotenv').config({ path: '.env.local' });

async function debugAuth() {
  console.log('🔍 Debugging Supabase Authentication Configuration\n');

  try {
    const { createClient } = require('@supabase/supabase-js');
    
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    console.log('📧 Testing magic link for:', process.env.ALLOWED_EMAIL_1);
    
    // Test sending magic link
    const { data, error } = await supabase.auth.signInWithOtp({
      email: process.env.ALLOWED_EMAIL_1,
      options: {
        emailRedirectTo: 'https://masterthreader.vercel.app/auth/callback',
      },
    });

    if (error) {
      console.log('❌ Magic link failed:', error.message);
      console.log('🔧 Error details:', JSON.stringify(error, null, 2));
      
      if (error.message.includes('Email not confirmed')) {
        console.log('\n💡 Solution: Disable "Confirm email" in Supabase Authentication settings');
      } else if (error.message.includes('Invalid login credentials')) {
        console.log('\n💡 Solution: Enable Email provider in Supabase Authentication settings');
      } else if (error.message.includes('Email rate limit')) {
        console.log('\n💡 Solution: Wait a few minutes before trying again');
      }
    } else {
      console.log('✅ Magic link sent successfully!');
      console.log('📬 Check your email for the magic link');
      console.log('🔗 Data:', JSON.stringify(data, null, 2));
    }

  } catch (error) {
    console.log('❌ Debug failed:', error.message);
  }
}

debugAuth().catch(console.error); 