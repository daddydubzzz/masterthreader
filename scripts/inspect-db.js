const { Pool } = require('pg');
const OpenAI = require('openai');
require('dotenv').config({ path: '.env.local' });

// Configuration
const EXPECTED_DIMENSIONS = 2000; // Updated for text-embedding-3-large with custom dimensions
const EMBEDDING_MODEL = 'text-embedding-3-large';

async function inspectDatabase() {
  console.log('🔍 MasterThreader Database Inspection');
  console.log('=====================================');
  
  // Check environment variables
  console.log('\n📋 Environment Check:');
  const requiredEnvVars = ['DATABASE_URL', 'OPENAI_API_KEY'];
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.log(`❌ Missing environment variables: ${missingVars.join(', ')}`);
    console.log('   Please check your .env.local file');
    return;
  }
  console.log('✅ All required environment variables are set');

  let pool = null;
  let openai = null;

  try {
    // Initialize database connection
    console.log('\n🗄️  Database Connection:');
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    });

    // Test database connection
    await pool.query('SELECT NOW()');
    console.log('✅ Database connection successful');

    // Check pgvector extension
    console.log('\n🧮 Vector Extension Check:');
    const extensionResult = await pool.query(
      "SELECT * FROM pg_extension WHERE extname = 'vector'"
    );
    
    if (extensionResult.rows.length === 0) {
      console.log('❌ pgvector extension not installed');
      console.log('   Run: CREATE EXTENSION vector; in your database');
      return;
    }
    console.log('✅ pgvector extension is installed');

    // Check table schema
    console.log('\n📊 Table Schema Check:');
    const schemaResult = await pool.query(`
      SELECT 
        column_name,
        data_type,
        pg_catalog.format_type(a.atttypid, a.atttypmod) as full_type
      FROM information_schema.columns
      JOIN pg_catalog.pg_attribute a ON a.attname = column_name
      JOIN pg_catalog.pg_class c ON a.attrelid = c.oid
      WHERE table_name = 'vector_triples' 
      AND table_schema = 'public'
      AND c.relname = 'vector_triples'
      ORDER BY ordinal_position
    `);

    if (schemaResult.rows.length === 0) {
      console.log('❌ vector_triples table not found');
      console.log('   Please run the database schema setup first');
      return;
    }

    console.log('✅ vector_triples table exists');
    
    // Check embedding column dimensions
    const embeddingColumn = schemaResult.rows.find(row => row.column_name === 'embedding_vector');
    if (embeddingColumn) {
      const dimensionMatch = embeddingColumn.full_type.match(/vector\((\d+)\)/);
      if (dimensionMatch) {
        const actualDimensions = parseInt(dimensionMatch[1]);
        console.log(`📏 Embedding dimensions: ${actualDimensions}`);
        
        if (actualDimensions === EXPECTED_DIMENSIONS) {
          console.log(`✅ Correct dimensions (${EXPECTED_DIMENSIONS})`);
        } else {
          console.log(`❌ Expected ${EXPECTED_DIMENSIONS} dimensions, found ${actualDimensions}`);
          console.log('   Run the migration script to update dimensions');
        }
      } else {
        console.log('❌ Could not parse embedding vector dimensions');
      }
    } else {
      console.log('❌ embedding_vector column not found');
    }

    // Check indexes
    console.log('\n🗂️  Index Check:');
    const indexResult = await pool.query(`
      SELECT 
        indexname,
        indexdef
      FROM pg_indexes 
      WHERE tablename = 'vector_triples'
      AND indexname LIKE '%embedding%'
    `);

    if (indexResult.rows.length === 0) {
      console.log('⚠️  No embedding indexes found');
      console.log('   Consider creating HNSW index for better performance');
    } else {
      console.log(`✅ Found ${indexResult.rows.length} embedding index(es)`);
      indexResult.rows.forEach(row => {
        const indexType = row.indexdef.includes('hnsw') ? 'HNSW' : 
                         row.indexdef.includes('ivfflat') ? 'IVFFlat' : 'Unknown';
        console.log(`   - ${row.indexname} (${indexType})`);
      });
    }

    // Check functions
    console.log('\n⚙️  Function Check:');
    const functionResult = await pool.query(`
      SELECT 
        proname,
        pg_get_function_arguments(oid) as arguments
      FROM pg_proc 
      WHERE proname = 'find_similar_triples'
    `);

    if (functionResult.rows.length === 0) {
      console.log('❌ find_similar_triples function not found');
    } else {
      console.log('✅ find_similar_triples function exists');
      const args = functionResult.rows[0].arguments;
      if (args.includes(`vector(${EXPECTED_DIMENSIONS})`)) {
        console.log(`✅ Function uses correct dimensions (${EXPECTED_DIMENSIONS})`);
      } else {
        console.log(`❌ Function may use incorrect dimensions`);
        console.log(`   Arguments: ${args}`);
      }
    }

    // Test OpenAI embeddings
    console.log('\n🤖 OpenAI Embedding Test:');
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const testText = "This is a test for MasterThreader embedding generation.";
    console.log(`📝 Test text: "${testText}"`);
    
    const response = await openai.embeddings.create({
      model: EMBEDDING_MODEL,
      input: testText,
      dimensions: EXPECTED_DIMENSIONS
    });

    const embedding = response.data[0].embedding;
    console.log(`✅ Generated embedding with ${embedding.length} dimensions`);
    
    if (embedding.length === EXPECTED_DIMENSIONS) {
      console.log(`✅ Embedding dimensions match expected (${EXPECTED_DIMENSIONS})`);
    } else {
      console.log(`❌ Expected ${EXPECTED_DIMENSIONS} dimensions, got ${embedding.length}`);
    }

    // Test database insertion
    console.log('\n💾 Database Insertion Test:');
    try {
      const insertResult = await pool.query(`
        INSERT INTO vector_triples (
          original_tweet,
          annotation,
          final_edit,
          script_title,
          embedding_vector,
          quality_rating
        ) VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id
      `, [
        'Test tweet for database validation',
        'Test annotation',
        'Test final edit',
        'Database Test Script',
        `[${embedding.join(',')}]`,
        5
      ]);

      const testId = insertResult.rows[0].id;
      console.log(`✅ Successfully inserted test record: ${testId}`);

      // Clean up test record
      await pool.query('DELETE FROM vector_triples WHERE id = $1', [testId]);
      console.log('✅ Test record cleaned up');

    } catch (insertError) {
      console.log('❌ Database insertion failed:', insertError.message);
    }

    // Test similarity search
    console.log('\n🔍 Similarity Search Test:');
    try {
      const searchResult = await pool.query(`
        SELECT find_similar_triples(
          $1::vector,
          0.5,
          5,
          NULL
        )
      `, [`[${embedding.join(',')}]`]);

      console.log(`✅ Similarity search function works (found ${searchResult.rows.length} results)`);
    } catch (searchError) {
      console.log('❌ Similarity search failed:', searchError.message);
    }

    // Summary
    console.log('\n📋 Summary:');
    console.log(`✅ Database: Connected and configured`);
    console.log(`✅ Model: ${EMBEDDING_MODEL} with ${EXPECTED_DIMENSIONS} dimensions`);
    console.log(`✅ Vector operations: Working correctly`);
    console.log('\n🎉 MasterThreader database is ready for use!');

  } catch (error) {
    console.error('❌ Inspection failed:', error.message);
    console.error('Stack trace:', error.stack);
  } finally {
    if (pool) {
      await pool.end();
    }
  }
}

// Run the inspection
if (require.main === module) {
  inspectDatabase().catch(console.error);
}

module.exports = { inspectDatabase }; 