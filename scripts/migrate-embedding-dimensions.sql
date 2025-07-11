-- Migration script to update embedding dimensions from 1536 to 2000
-- This supports the upgraded text-embedding-3-large model with custom dimensions
-- Run this in your Supabase SQL editor

-- Step 1: Drop dependent views
DROP VIEW IF EXISTS best_examples;
DROP VIEW IF EXISTS recurring_patterns;

-- Step 2: Drop existing indexes and functions that depend on the column
DROP INDEX IF EXISTS vector_triples_embedding_hnsw_idx;
DROP INDEX IF EXISTS idx_vector_triples_embedding_cosine;
DROP INDEX IF EXISTS idx_vector_triples_embedding_l2;
-- Drop function with all possible signatures (PostgreSQL uses different type names)
DROP FUNCTION IF EXISTS find_similar_triples(vector, float, integer, integer);
DROP FUNCTION IF EXISTS find_similar_triples(vector, double precision, integer, integer);
DROP FUNCTION IF EXISTS find_similar_triples(vector(1536), float, integer, integer);
DROP FUNCTION IF EXISTS find_similar_triples(vector(1536), double precision, integer, integer);
-- Drop other functions that might conflict
DROP FUNCTION IF EXISTS analyze_editing_patterns();
DROP FUNCTION IF EXISTS mark_pattern_resolved(UUID, TEXT);

-- Step 3: Alter the column to use 2000 dimensions
ALTER TABLE vector_triples 
ALTER COLUMN embedding_vector TYPE vector(2000);

-- Step 4: Clear existing embeddings (they need to be regenerated with new model)
UPDATE vector_triples SET embedding_vector = NULL;

-- Step 5: Recreate the HNSW index (supports high dimensions)
CREATE INDEX vector_triples_embedding_hnsw_idx 
ON vector_triples USING hnsw (embedding_vector vector_cosine_ops);

-- Step 6: Recreate the function with updated dimensions
CREATE OR REPLACE FUNCTION find_similar_triples(
  query_embedding vector(2000),
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

-- Step 7: Recreate the views
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