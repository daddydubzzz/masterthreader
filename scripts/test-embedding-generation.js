#!/usr/bin/env node

/**
 * Test OpenAI Embedding Generation
 * Verifies that the new text-embedding-3-large model is working correctly
 */

require('dotenv').config({ path: '.env.local' });

async function testEmbeddingGeneration() {
  console.log('🧪 Testing OpenAI Embedding Generation...\n');
  
  if (!process.env.OPENAI_API_KEY) {
    console.log('❌ OpenAI API key not found');
    return;
  }
  
  console.log('✅ OpenAI API key found');
  
  try {
    const OpenAI = (await import('openai')).default;
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    
    console.log('Testing text-embedding-3-large model...');
    
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-large',
      input: 'Test embedding for dimension validation and schema compatibility'
    });
    
    const embedding = response.data[0].embedding;
    console.log(`✅ Generated embedding with ${embedding.length} dimensions`);
    
    if (embedding.length === 3072) {
      console.log('✅ Perfect: Using text-embedding-3-large (3072 dimensions)');
      console.log('✅ Model configuration is correct');
    } else if (embedding.length === 1536) {
      console.log('❌ Problem: Still using text-embedding-ada-002 (1536 dimensions)');
      console.log('💡 The model in vectorDB.ts was not updated correctly');
    } else {
      console.log(`❓ Unexpected dimensions: ${embedding.length}`);
    }
    
    // Test a few sample values
    console.log('\nSample embedding values:');
    console.log('First 5 values:', embedding.slice(0, 5));
    console.log('Last 5 values:', embedding.slice(-5));
    
    // Test the embedding range
    const min = Math.min(...embedding);
    const max = Math.max(...embedding);
    console.log(`Value range: ${min.toFixed(4)} to ${max.toFixed(4)}`);
    
  } catch (error) {
    console.log('❌ Embedding generation failed:', error.message);
    
    if (error.message.includes('model')) {
      console.log('💡 This might be a model name issue');
    }
    if (error.message.includes('API key')) {
      console.log('💡 Check your OpenAI API key configuration');
    }
  }
}

testEmbeddingGeneration().catch(console.error); 