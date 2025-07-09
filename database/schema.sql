-- MasterThreader Vector Database Schema
-- This schema stores Josh's editing patterns for AI learning

-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- RAG Vector Triples table for contextualizing new scripts with past examples
CREATE TABLE IF NOT EXISTS vector_triples (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    original_tweet TEXT NOT NULL,
    annotation TEXT NOT NULL,
    final_edit TEXT NOT NULL,
    script_title TEXT,
    position_in_thread INTEGER,
    embedding_vector vector(1536), -- OpenAI ada-002 embedding size (full triple)
    quality_rating INTEGER CHECK (quality_rating BETWEEN 1 AND 5) DEFAULT 3,
    resolved BOOLEAN DEFAULT FALSE
);



-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_vector_triples_created_at ON vector_triples(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_vector_triples_script_title ON vector_triples(script_title);
CREATE INDEX IF NOT EXISTS idx_vector_triples_quality_rating ON vector_triples(quality_rating DESC);
CREATE INDEX IF NOT EXISTS idx_vector_triples_resolved ON vector_triples(resolved);
CREATE INDEX IF NOT EXISTS idx_vector_triples_position ON vector_triples(position_in_thread);

-- Vector similarity index using cosine distance (primary for RAG)
CREATE INDEX IF NOT EXISTS idx_vector_triples_embedding_cosine 
ON vector_triples USING ivfflat (embedding_vector vector_cosine_ops)
WITH (lists = 100);

-- Vector similarity index using L2 distance (alternative)
CREATE INDEX IF NOT EXISTS idx_vector_triples_embedding_l2 
ON vector_triples USING ivfflat (embedding_vector vector_l2_ops)
WITH (lists = 100);

-- View for finding recurring patterns (similar tweets that appear frequently)
CREATE OR REPLACE VIEW recurring_patterns AS
SELECT 
    original_tweet,
    COUNT(*) as frequency,
    array_agg(final_edit ORDER BY created_at DESC) as all_edits,
    array_agg(annotation ORDER BY created_at DESC) as all_annotations,
    MAX(created_at) as latest_occurrence,
    AVG(quality_rating) as avg_quality_rating
FROM vector_triples 
WHERE resolved = FALSE 
GROUP BY original_tweet
HAVING COUNT(*) >= 2
ORDER BY frequency DESC, latest_occurrence DESC;

-- View for best examples (high quality examples for RAG contextualization)
CREATE OR REPLACE VIEW best_examples AS
SELECT *
FROM vector_triples
WHERE quality_rating >= 4
ORDER BY quality_rating DESC, created_at DESC;



-- Function to find similar vector triples for RAG contextualization
CREATE OR REPLACE FUNCTION find_similar_triples(
    query_embedding vector(1536),
    similarity_threshold float DEFAULT 0.8,
    result_limit integer DEFAULT 10,
    min_quality integer DEFAULT NULL
)
RETURNS TABLE (
    id UUID,
    original_tweet TEXT,
    annotation TEXT,
    final_edit TEXT,
    similarity_score float
)
LANGUAGE sql
AS $$
    SELECT 
        vt.id,
        vt.original_tweet,
        vt.annotation,
        vt.final_edit,
        1 - (vt.embedding_vector <=> query_embedding) as similarity_score
    FROM vector_triples vt
    WHERE 
        (vt.embedding_vector <=> query_embedding) < (1 - similarity_threshold)
        AND (min_quality IS NULL OR vt.quality_rating >= min_quality)
    ORDER BY vt.embedding_vector <=> query_embedding
    LIMIT result_limit;
$$;



-- Function to mark patterns as resolved when they're successfully incorporated
CREATE OR REPLACE FUNCTION mark_pattern_resolved(
    pattern_id UUID,
    rule_contribution TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE sql
AS $$
    UPDATE edit_patterns 
    SET 
        resolved = TRUE,
        prompt_rule_contribution = COALESCE(rule_contribution, prompt_rule_contribution)
    WHERE id = pattern_id;
    
    SELECT FOUND;
$$;

-- Function to analyze patterns and provide insights
CREATE OR REPLACE FUNCTION analyze_editing_patterns()
RETURNS JSON
LANGUAGE sql
AS $$
    SELECT json_build_object(
        'total_patterns', (SELECT COUNT(*) FROM edit_patterns),
        'unresolved_patterns', (SELECT COUNT(*) FROM edit_patterns WHERE resolved = FALSE),
        'avg_quality_rating', (SELECT ROUND(AVG(quality_rating)::numeric, 2) FROM edit_patterns WHERE quality_rating IS NOT NULL),
        'top_recurring_issues', (
            SELECT json_agg(json_build_object(
                'original_text', original_text,
                'frequency', frequency,
                'latest_edit', (all_edits)[1]
            ))
            FROM recurring_issues
            LIMIT 5
        ),
        'recent_successful_patterns', (
            SELECT json_agg(json_build_object(
                'original_text', original_text,
                'edit_text', edit_text,
                'quality_rating', quality_rating
            ))
            FROM successful_patterns
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