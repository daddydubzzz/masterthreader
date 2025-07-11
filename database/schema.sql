-- MasterThreader Vector Database Schema
-- This schema stores user editing patterns for AI learning

-- Enable the pgvector extension for embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- Table for storing vector triples (tweet transformations with context)
CREATE TABLE IF NOT EXISTS vector_triples (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  original_tweet TEXT NOT NULL,
  annotation TEXT NOT NULL,
  final_edit TEXT NOT NULL,
  script_title TEXT,
  position_in_thread INTEGER,
  embedding_vector vector(2000), -- Reduced from 3072 to 2000 for Supabase pgvector compatibility
  quality_rating INTEGER DEFAULT 3 CHECK (quality_rating BETWEEN 1 AND 5),
  resolved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create HNSW index for fast similarity search (supports high dimensions)
CREATE INDEX IF NOT EXISTS vector_triples_embedding_hnsw_idx 
ON vector_triples USING hnsw (embedding_vector vector_cosine_ops);

-- Create additional indexes for filtering
CREATE INDEX IF NOT EXISTS vector_triples_quality_idx ON vector_triples(quality_rating);
CREATE INDEX IF NOT EXISTS vector_triples_resolved_idx ON vector_triples(resolved);
CREATE INDEX IF NOT EXISTS vector_triples_script_idx ON vector_triples(script_title);

-- Function to find similar triples using cosine similarity
CREATE OR REPLACE FUNCTION find_similar_triples(
  query_embedding vector(2000), -- Updated dimension
  similarity_threshold FLOAT DEFAULT 0.8,
  result_limit INTEGER DEFAULT 10,
  quality_filter INTEGER DEFAULT NULL
)
RETURNS TABLE(
  id UUID,
  original_tweet TEXT,
  annotation TEXT,
  final_edit TEXT,
  script_title TEXT,
  position_in_thread INTEGER,
  quality_rating INTEGER,
  similarity_score FLOAT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    vt.id,
    vt.original_tweet,
    vt.annotation,
    vt.final_edit,
    vt.script_title,
    vt.position_in_thread,
    vt.quality_rating,
    1 - (vt.embedding_vector <=> query_embedding) AS similarity_score
  FROM vector_triples vt
  WHERE 
    (quality_filter IS NULL OR vt.quality_rating >= quality_filter)
    AND (1 - (vt.embedding_vector <=> query_embedding)) >= similarity_threshold
  ORDER BY vt.embedding_vector <=> query_embedding
  LIMIT result_limit;
END;
$$ LANGUAGE plpgsql;

-- View for best examples (high quality, unresolved)
CREATE OR REPLACE VIEW best_examples AS
SELECT 
  id,
  original_tweet,
  annotation,
  final_edit,
  script_title,
  position_in_thread,
  quality_rating,
  created_at
FROM vector_triples
WHERE quality_rating >= 4 AND resolved = FALSE
ORDER BY quality_rating DESC, created_at DESC;

-- View for recurring patterns analysis
CREATE OR REPLACE VIEW recurring_patterns AS
SELECT 
  annotation,
  COUNT(*) as frequency,
  AVG(quality_rating) as avg_quality,
  array_agg(DISTINCT script_title) as script_titles,
  MAX(created_at) as last_seen
FROM vector_triples
WHERE resolved = FALSE
GROUP BY annotation
HAVING COUNT(*) > 1
ORDER BY frequency DESC, avg_quality DESC;

-- Function to mark patterns as resolved when they're successfully incorporated
CREATE OR REPLACE FUNCTION mark_pattern_resolved(
    pattern_id UUID,
    rule_contribution TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE vector_triples 
    SET resolved = TRUE
    WHERE id = pattern_id;
    
    RETURN FOUND;
END;
$$;

-- Function to analyze patterns and provide insights
CREATE OR REPLACE FUNCTION analyze_editing_patterns()
RETURNS JSON
LANGUAGE sql
AS $$
    SELECT json_build_object(
        'total_patterns', (SELECT COUNT(*) FROM vector_triples),
        'unresolved_patterns', (SELECT COUNT(*) FROM vector_triples WHERE resolved = FALSE),
        'avg_quality_rating', (SELECT ROUND(AVG(quality_rating)::numeric, 2) FROM vector_triples WHERE quality_rating IS NOT NULL),
        'top_recurring_patterns', (
            SELECT json_agg(json_build_object(
                'annotation', annotation,
                'frequency', frequency,
                'avg_quality', avg_quality,
                'script_titles', script_titles
            ))
            FROM recurring_patterns
            LIMIT 5
        ),
        'recent_best_examples', (
            SELECT json_agg(json_build_object(
                'original_tweet', original_tweet,
                'final_edit', final_edit,
                'quality_rating', quality_rating
            ))
            FROM best_examples
            LIMIT 5
        )
    );
$$;

-- Insert sample vector triples for testing
INSERT INTO vector_triples (
    original_tweet,
    annotation,
    final_edit,
    script_title,
    position_in_thread,
    quality_rating,
    resolved
) VALUES 
(
    'Your brain is chemically primed for peak performance the moment you wake up.',
    'More precise scientific terminology - neurochemically is more specific than chemically',
    'Your brain is neurochemically optimized for peak performance the moment you wake up.',
    'Morning Flow State',
    0,
    5,
    TRUE
),
(
    'Here''s what I learned about productivity...',
    'Replace generic setup with scientific authority to create better hook',
    'Here''s what the neuroscience reveals about productivity...',
    'Morning Flow State', 
    1,
    4,
    FALSE
),
(
    'Brain resets when you move',
    'Turn this into a cliffhanger. Connect to previous tweet more explicitly.',
    'Ever notice how moving to a new room suddenly resets your brain? Here''s why that happens.',
    'Brain Reset Study',
    2,
    5,
    FALSE
); 