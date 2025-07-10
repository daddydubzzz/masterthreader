#!/usr/bin/env node

/**
 * Test script to verify authentication setup with existing Supabase project
 * Run with: node scripts/test-auth-setup.js
 */

require('dotenv').config({ path: '.env.local' });

async function testAuthSetup() {
  console.log('🔐 Testing MasterThreader Authentication Setup\n');

  // Test 1: Environment Variables
  console.log('1. Checking Environment Variables...');
  const requiredVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'ALLOWED_EMAIL_1',
    'ALLOWED_EMAIL_2',
    'NEXT_PUBLIC_ALLOWED_EMAIL_1',
    'NEXT_PUBLIC_ALLOWED_EMAIL_2'
  ];

  const existingVars = [
    'DATABASE_URL',
    'OPENAI_API_KEY'
  ];

  let allGood = true;

  // Check existing variables (should already be set)
  console.log('   Existing variables (should already be configured):');
  existingVars.forEach(varName => {
    const value = process.env[varName];
    if (value) {
      console.log(`   ✅ ${varName}: ${value.substring(0, 20)}...`);
    } else {
      console.log(`   ❌ ${varName}: Not set`);
      allGood = false;
    }
  });

  // Check new auth variables (need to be added)
  console.log('\n   New authentication variables (need to be added):');
  requiredVars.forEach(varName => {
    const value = process.env[varName];
    if (value) {
      console.log(`   ✅ ${varName}: ${value}`);
    } else {
      console.log(`   ⚠️  ${varName}: Not set (needs to be added)`);
    }
  });

  // Test 2: Supabase Connection
  console.log('\n2. Testing Supabase Connection...');
  try {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      const { createClient } = require('@supabase/supabase-js');
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      );

      // Test basic connection
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        console.log(`   ⚠️  Supabase connection test: ${error.message}`);
      } else {
        console.log('   ✅ Supabase client initialized successfully');
      }
    } else {
      console.log('   ⚠️  Supabase credentials not configured yet');
    }
  } catch (error) {
    console.log(`   ❌ Supabase connection failed: ${error.message}`);
    allGood = false;
  }

  // Test 3: Database Connection (existing)
  console.log('\n3. Testing Database Connection (existing setup)...');
  try {
    if (process.env.DATABASE_URL) {
      const { Pool } = require('pg');
      const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      });

      const result = await pool.query('SELECT COUNT(*) FROM vector_triples');
      console.log(`   ✅ Database connected: ${result.rows[0].count} vector triples stored`);
      await pool.end();
    } else {
      console.log('   ❌ DATABASE_URL not configured');
      allGood = false;
    }
  } catch (error) {
    console.log(`   ❌ Database connection failed: ${error.message}`);
    allGood = false;
  }

  // Test 4: Email Configuration
  console.log('\n4. Checking Email Configuration...');
  const allowedEmails = [
    process.env.ALLOWED_EMAIL_1,
    process.env.ALLOWED_EMAIL_2,
    process.env.NEXT_PUBLIC_ALLOWED_EMAIL_1,
    process.env.NEXT_PUBLIC_ALLOWED_EMAIL_2,
  ].filter(Boolean);

  if (allowedEmails.length >= 2) {
    console.log(`   ✅ ${allowedEmails.length} email addresses configured`);
    allowedEmails.forEach((email, i) => {
      console.log(`   📧 Email ${i + 1}: ${email}`);
    });
  } else {
    console.log('   ⚠️  Email addresses not fully configured yet');
  }

  // Summary
  console.log('\n📋 Setup Summary:');
  if (allGood && allowedEmails.length >= 2) {
    console.log('✅ Authentication setup is complete and ready!');
    console.log('\n🚀 Next steps:');
    console.log('1. Go to your Supabase dashboard');
    console.log('2. Enable Email authentication in Authentication > Settings');
    console.log('3. Add redirect URLs for your domain');
    console.log('4. Deploy with environment variables');
  } else {
    console.log('⚠️  Setup needs completion:');
    if (!allGood) {
      console.log('- Configure missing environment variables');
    }
    if (allowedEmails.length < 2) {
      console.log('- Add email authentication variables');
    }
    console.log('\nSee AUTHENTICATION_SETUP.md for detailed instructions');
  }
}

// Run the test
testAuthSetup().catch(error => {
  console.error('❌ Test failed:', error.message);
  process.exit(1);
}); 