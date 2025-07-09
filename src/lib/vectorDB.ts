import { Pool } from 'pg';
import { VectorTriple, VectorTripleQuery, SimilarTriple, RAGAnalysis } from '@/types';

// Database connection pool
let pool: Pool | null = null;

function getDBPool(): Pool {
  if (!pool) {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL not configured - vector DB unavailable');
    }
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    });
  }
  return pool;
}

// Generate embeddings using OpenAI
async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const OpenAI = (await import('openai')).default;
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const response = await openai.embeddings.create({
      model: 'text-embedding-ada-002',
      input: text,
    });

    return response.data[0].embedding;
  } catch (error) {
    console.error('Failed to generate embedding:', error);
    throw new Error('Embedding generation failed');
  }
}

// Store a vector triple in the RAG database
export async function captureVectorTriple(triple: VectorTriple): Promise<string> {
  try {
    // Check if database is configured
    if (!process.env.DATABASE_URL) {
      console.warn('DATABASE_URL not configured - vector triple not captured');
      return 'no-db-mock-id';
    }

    const pool = getDBPool();
    
    // Generate embedding from the full triple context
    const embeddingText = `${triple.original_tweet} ${triple.annotation} ${triple.final_edit}`.trim();
    const embedding = await generateEmbedding(embeddingText);

    const query = `
      INSERT INTO vector_triples (
        original_tweet,
        annotation,
        final_edit,
        script_title,
        position_in_thread,
        embedding_vector,
        quality_rating,
        resolved
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id
    `;

    const values = [
      triple.original_tweet,
      triple.annotation,
      triple.final_edit,
      triple.script_title,
      triple.position_in_thread,
      `[${embedding.join(',')}]`, // PostgreSQL vector format
      triple.quality_rating || 3, // Default to medium quality
      triple.resolved || false,
    ];

    const result = await pool.query(query, values);
    return result.rows[0].id;
  } catch (error) {
    console.warn('Failed to capture vector triple (database unavailable):', error);
    return 'error-mock-id'; // Return mock ID instead of throwing
  }
}

// Find similar vector triples for RAG contextualization
export async function findSimilarTriples(query: VectorTripleQuery): Promise<SimilarTriple[]> {
  try {
    // Check if database is configured
    if (!process.env.DATABASE_URL) {
      console.warn('DATABASE_URL not configured - returning empty results');
      return [];
    }

    const pool = getDBPool();
    
    // Generate embedding for the query text
    const queryEmbedding = await generateEmbedding(query.query_text);
    
    const dbQuery = `
      SELECT * FROM find_similar_triples(
        $1::vector,
        $2,
        $3,
        $4
      )
    `;

    const values = [
      `[${queryEmbedding.join(',')}]`, // Query embedding
      query.similarity_threshold || 0.8,
      query.limit || 10,
      query.quality_filter || null,
    ];

    const result = await pool.query(dbQuery, values);
    
    return result.rows.map(row => ({
      triple: {
        id: row.id,
        original_tweet: row.original_tweet,
        annotation: row.annotation,
        final_edit: row.final_edit,
      },
      similarity_score: row.similarity_score,
    }));
  } catch (error) {
    console.warn('Failed to find similar triples (database unavailable):', error);
    return []; // Return empty array instead of throwing
  }
}

// Get contextual examples for script generation (main RAG function)
export async function getContextualExamples(scriptContext: string, limit = 5): Promise<VectorTriple[]> {
  try {
    // Check if database is configured
    if (!process.env.DATABASE_URL) {
      console.warn('DATABASE_URL not configured - RAG system unavailable');
      return [];
    }

    // Find high-quality examples similar to the script context
    const similarTriples = await findSimilarTriples({
      query_text: scriptContext,
      similarity_threshold: 0.7, // Lower threshold to get more examples
      limit: limit * 2, // Get more to filter for quality
      quality_filter: 4, // Only high-quality examples
    });

    // Return the best examples for contextualization
    return similarTriples.slice(0, limit).map(st => st.triple);
  } catch (error) {
    console.warn('Failed to get contextual examples (database unavailable):', error);
    return []; // Return empty array rather than failing
  }
}

// Mark a triple as resolved when incorporated into mega prompt
export async function markTripleResolved(tripleId: string): Promise<boolean> {
  const pool = getDBPool();
  
  try {
    const query = `
      UPDATE vector_triples 
      SET resolved = TRUE
      WHERE id = $1
      RETURNING id
    `;
    
    const result = await pool.query(query, [tripleId]);
    return (result.rowCount ?? 0) > 0;
  } catch (error) {
    console.error('Failed to mark triple as resolved:', error);
    throw new Error('Triple update failed');
  }
}

// Get recurring patterns for mega prompt optimization
export async function getRecurringPatterns(limit = 10): Promise<Array<{
  original_tweet: string;
  frequency: number;
  best_example: VectorTriple;
  common_annotations: string[];
}>> {
  const pool = getDBPool();
  
  try {
    const query = `
      SELECT 
        rp.original_tweet,
        rp.frequency,
        vt.id, vt.original_tweet, vt.annotation, vt.final_edit, vt.quality_rating,
        rp.all_annotations
      FROM recurring_patterns rp
      JOIN vector_triples vt ON vt.original_tweet = rp.original_tweet 
        AND vt.quality_rating = (
          SELECT MAX(quality_rating) 
          FROM vector_triples vt2 
          WHERE vt2.original_tweet = rp.original_tweet
        )
      ORDER BY rp.frequency DESC, vt.created_at DESC
      LIMIT $1
    `;

    const result = await pool.query(query, [limit]);
    
    return result.rows.map(row => ({
      original_tweet: row.original_tweet,
      frequency: row.frequency,
      best_example: {
        id: row.id,
        original_tweet: row.original_tweet,
        annotation: row.annotation,
        final_edit: row.final_edit,
        quality_rating: row.quality_rating,
      },
      common_annotations: row.all_annotations?.filter((a: string) => a) || [],
    }));
  } catch (error) {
    console.error('Failed to get recurring patterns:', error);
    throw new Error('Recurring patterns retrieval failed');
  }
}

// Get best examples for reference and quality benchmarking
export async function getBestExamples(limit = 10): Promise<VectorTriple[]> {
  const pool = getDBPool();
  
  try {
    const query = `
      SELECT * FROM best_examples
      LIMIT $1
    `;

    const result = await pool.query(query, [limit]);
    
    return result.rows.map(row => ({
      id: row.id,
      created_at: row.created_at,
      original_tweet: row.original_tweet,
      annotation: row.annotation,
      final_edit: row.final_edit,
      script_title: row.script_title,
      position_in_thread: row.position_in_thread,
      quality_rating: row.quality_rating,
      resolved: row.resolved,
    }));
  } catch (error) {
    console.error('Failed to get best examples:', error);
    throw new Error('Best examples retrieval failed');
  }
}

// Comprehensive RAG analysis for system improvement
export async function performRAGAnalysis(): Promise<RAGAnalysis> {
  const pool = getDBPool();
  
  try {
    const [recurringPatterns, bestExamples] = await Promise.all([
      getRecurringPatterns(5),
      getBestExamples(5),
    ]);

    // Get total stats for contextualization opportunities
    const statsQuery = `
      SELECT 
        COUNT(*) as total_triples,
        COUNT(*) FILTER (WHERE resolved = FALSE) as unresolved_triples,
        AVG(quality_rating) as avg_quality
      FROM vector_triples
    `;
    const statsResult = await pool.query(statsQuery);
    const stats = statsResult.rows[0];

    // Generate contextualization opportunities
    const opportunities = [];
    
    if (recurringPatterns.length > 0) {
      opportunities.push(
        `${recurringPatterns.length} recurring patterns can be used to improve first-pass generation`
      );
    }

    if (stats.unresolved_triples > stats.total_triples * 0.7) {
      opportunities.push(
        'High percentage of unresolved patterns - opportunity for mega prompt updates'
      );
    }

    if (stats.avg_quality < 3.5) {
      opportunities.push(
        'Consider focusing on higher-quality examples for better RAG contextualization'
      );
    }

    if (bestExamples.length >= 5) {
      opportunities.push(
        'Sufficient high-quality examples available for effective RAG contextualization'
      );
    }

    return {
      recurring_patterns: recurringPatterns,
      best_examples: bestExamples,
      contextualization_opportunities: opportunities,
    };
  } catch (error) {
    console.error('Failed to perform RAG analysis:', error);
    throw new Error('RAG analysis failed');
  }
}



// Close database connection (for cleanup)
export async function closeDBConnection(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
  }
} 