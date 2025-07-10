const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function inspectDatabase() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL
  });
  
  try {
    console.log('🔍 MasterThreader Database Inspection\n');
    
    // Check connection
    await pool.query('SELECT NOW()');
    console.log('✅ Database connection successful\n');
    
    // Vector Triples Overview
    console.log('=== 📊 Vector Triples Overview ===');
    const overview = await pool.query(`
      SELECT 
        COUNT(*) as total_triples,
        COUNT(embedding_vector) as with_embeddings,
        AVG(quality_rating) as avg_quality,
        MIN(created_at) as oldest,
        MAX(created_at) as newest
      FROM vector_triples
    `);
    console.table(overview.rows);
    
    // Recent Triples
    console.log('\n=== 📝 Recent Vector Triples ===');
    const recent = await pool.query(`
      SELECT 
        id, 
        LEFT(original_tweet, 50) as original_snippet,
        LEFT(annotation, 30) as annotation_snippet,
        LEFT(final_edit, 50) as edit_snippet,
        quality_rating,
        created_at 
      FROM vector_triples 
      ORDER BY created_at DESC 
      LIMIT 10
    `);
    console.table(recent.rows);
    
    // Pattern Analysis
    console.log('\n=== 🔄 Recurring Patterns ===');
    const patterns = await pool.query(`
      SELECT 
        LEFT(original_tweet, 40) as pattern,
        COUNT(*) as frequency,
        AVG(quality_rating) as avg_quality
      FROM vector_triples 
      GROUP BY original_tweet 
      HAVING COUNT(*) > 1 
      ORDER BY frequency DESC, avg_quality DESC
      LIMIT 5
    `);
    
    if (patterns.rows.length > 0) {
      console.table(patterns.rows);
    } else {
      console.log('No recurring patterns found yet.');
    }
    
    // Quality Distribution
    console.log('\n=== ⭐ Quality Rating Distribution ===');
    const quality = await pool.query(`
      SELECT 
        quality_rating,
        COUNT(*) as count,
        ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 1) as percentage
      FROM vector_triples 
      WHERE quality_rating IS NOT NULL
      GROUP BY quality_rating 
      ORDER BY quality_rating DESC
    `);
    console.table(quality.rows);
    
    // Script Context Analysis
    console.log('\n=== 📋 Script Context Analysis ===');
    const scripts = await pool.query(`
      SELECT 
        script_title,
        COUNT(*) as edits_count,
        AVG(quality_rating) as avg_quality
      FROM vector_triples 
      WHERE script_title IS NOT NULL
      GROUP BY script_title 
      ORDER BY edits_count DESC
      LIMIT 5
    `);
    
    if (scripts.rows.length > 0) {
      console.table(scripts.rows);
    } else {
      console.log('No script context data found yet.');
    }
    
    // Embedding Status
    console.log('\n=== 🧠 Embedding Generation Status ===');
    const embeddings = await pool.query(`
      SELECT 
        CASE 
          WHEN embedding_vector IS NOT NULL THEN 'Has Embedding'
          ELSE 'Missing Embedding'
        END as status,
        COUNT(*) as count
      FROM vector_triples 
      GROUP BY (embedding_vector IS NOT NULL)
    `);
    console.table(embeddings.rows);
    
    console.log('\n✅ Database inspection complete!');
    
  } catch (error) {
    console.error('❌ Database inspection failed:', error.message);
    
    if (error.message.includes('relation "vector_triples" does not exist')) {
      console.log('\n💡 Tip: Run the database setup first:');
      console.log('   npm run db:setup');
    }
  } finally {
    await pool.end();
  }
}

// Run if called directly
if (require.main === module) {
  inspectDatabase().catch(console.error);
}

module.exports = { inspectDatabase }; 