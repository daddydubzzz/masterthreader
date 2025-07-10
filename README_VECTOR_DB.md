# RAG Vector Database System for MasterThreader

## Overview

MasterThreader implements a **Retrieval-Augmented Generation (RAG)** system using vector embeddings to learn from user editing patterns and improve AI thread generation quality over time.

## 🎯 RAG Strategy

The purpose of the RAG layer is to:

- **Contextualize new scripts** using past annotated examples
- **Help the system make smarter decisions** without hardcoding every rule into the Mega Prompt
- **Let the best examples float to the top** and be reused, increasing first-pass output quality

### Vector Triple Architecture

We treat every edit as a **vector triple**:

```typescript
{
  original_tweet: "Brain resets when you move",
  annotation: "Turn this into a cliffhanger. Connect to previous tweet more explicitly.",
  final_edit: "Ever notice how moving to a new room suddenly resets your brain? Here's why that happens."
}
```

This allows us to:
- **Embed the full example** for comprehensive context
- **Search by similarity** when new threads are generated
- **Feed relevant examples** into the LLM during generation and recursion

## 🏗️ Implementation

### Database Schema

**Primary Table: `vector_triples`**
```sql
CREATE TABLE vector_triples (
    id UUID PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    original_tweet TEXT NOT NULL,        -- AI's original output
    annotation TEXT NOT NULL,            -- User feedback/reasoning
    final_edit TEXT NOT NULL,            -- User's improved version
    script_title TEXT,                   -- Context grouping
    position_in_thread INTEGER,          -- Position context
    embedding_vector vector(1536),       -- OpenAI embedding of full triple
    quality_rating INTEGER (1-5),        -- Quality scoring (default: 3)
    resolved BOOLEAN DEFAULT FALSE       -- Incorporated into mega prompt
);
```

**Key Views:**
- `recurring_patterns` - Patterns users fix repeatedly
- `best_examples` - High-quality examples (rating ≥ 4)

### Core RAG Functions

**1. Contextual Example Retrieval**
```typescript
getContextualExamples(scriptContext: string, limit = 5): Promise<VectorTriple[]>
```
- Main RAG function for generation
- Finds high-quality examples similar to input script
- Used in `/api/generate` for better first-pass quality

**2. Pattern Analysis**
```typescript
findSimilarTriples(query: VectorTripleQuery): Promise<SimilarTriple[]>
```
- Vector similarity search
- Used in recursion for pattern-aware improvements

**3. Learning Integration**
```typescript
captureVectorTriple(triple: VectorTriple): Promise<string>
```
- Stores complete examples (original → annotation → final)
- Generates embeddings from full triple context
- Automatic capture during editing sessions

## 🔄 Data Flow

### 1. **Script Generation** (Enhanced with RAG)
```
User Script Input → getContextualExamples() → Enhanced Mega Prompt → Better First-Pass Threads
```

### 2. **Edit Capture** (Vector Triple Creation)
```
User Edits Tweet → User Adds Annotation → captureVectorTriple() → RAG Database
```

### 3. **Recursion** (Pattern-Aware Improvements)
```
Recursion Request → findSimilarTriples() → Pattern Context → Enhanced Recursion
```

### 4. **Learning Loop** (System Improvement)
```
More Examples → Better Context → Improved Generation → Less Manual Recursion
```

## 🚀 Setup Instructions

### 1. Database Setup

**Install PostgreSQL with pgvector:**
```bash
# Install pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

# Run the schema
psql -d your_database -f database/schema.sql
```

### 2. Environment Configuration

**Required Environment Variables:**
```bash
DATABASE_URL=postgresql://user:password@localhost:5432/masterthreader
OPENAI_API_KEY=sk-...
LLM_PROVIDER=openai  # or anthropic
```

### 3. Dependencies
```bash
npm install pg @types/pg pgvector
```

### 4. Initialize with Sample Data
The schema includes sample vector triples for immediate testing.

## 📊 API Endpoints

### Vector Triple Capture
```typescript
POST /api/capture-edit
{
  "original_tweet": "AI generated tweet",
  "annotation": "User feedback", 
  "final_edit": "User's improved version",
  "script_title": "Context",
  "quality_rating": 4
}
```

### Pattern Analysis
```typescript
GET /api/analyze-patterns
// Returns: RAG analysis with recurring patterns and best examples

POST /api/analyze-patterns  
{
  "query_text": "search query",
  "similarity_threshold": 0.8,
  "limit": 10
}
// Returns: Similar vector triples
```

### Pattern Resolution
```typescript
PATCH /api/analyze-patterns
{
  "triple_id": "uuid",
}
// Marks pattern as resolved/incorporated
```

## 🎛️ Quality Control

### Rating System (1-5)
- **5**: Perfect examples, immediate reuse
- **4**: High quality, recursion session edits
- **3**: Good examples, default rating
- **2**: Needs improvement
- **1**: Poor quality, rarely used

### Resolution Tracking
- `resolved: false` - Active learning examples
- `resolved: true` - Incorporated into mega prompt

## 🔍 Monitoring & Analytics

### Performance Metrics
- **First-pass quality improvement**: Fewer recursion cycles needed
- **Pattern frequency**: Most common editing patterns
- **Context effectiveness**: Similarity score distributions

### Usage Analytics
```sql
-- Most effective patterns
SELECT * FROM best_examples ORDER BY quality_rating DESC LIMIT 10;

-- Recurring issues needing attention  
SELECT * FROM recurring_patterns ORDER BY frequency DESC;

-- RAG database growth
SELECT COUNT(*), AVG(quality_rating) FROM vector_triples;
```

## 🛡️ Security & Performance

### Vector Index Optimization
- Cosine similarity index for semantic search
- L2 distance index for alternative matching
- Automatic index maintenance

### Data Privacy
- No personal data stored, only editing patterns
- Environment variable protection for API keys
- Database connection pooling for performance

## 🎯 Future Enhancements

### Phase 1: Enhanced Contextualization ✅
- [x] Vector triple capture
- [x] RAG-enhanced generation  
- [x] Pattern analysis infrastructure

### Phase 2: Smart Recursion 🔄
- [ ] Pattern-aware recursion prompts
- [ ] Context injection during recursion
- [ ] Adaptive mega prompt updates

### Phase 3: Self-Improving System 🎯
- [ ] Automatic quality rating
- [ ] Pattern consolidation
- [ ] Mega prompt auto-updates
- [ ] Performance feedback loops

## 🐛 Troubleshooting

### Common Issues

**1. Embedding Generation Fails**
- Check `OPENAI_API_KEY` environment variable
- Verify API key permissions and billing

**2. Database Connection Issues**  
- Verify `DATABASE_URL` format
- Check PostgreSQL and pgvector installation
- Ensure database exists and schema is applied

**3. Poor Context Quality**
- Increase `quality_filter` in queries
- Review and rate existing examples
- Add more high-quality training data

### Debugging Commands
```typescript
// Test vector similarity
GET /api/analyze-patterns?type=test

// Check RAG database status  
GET /api/capture-edit?limit=10

// Manual pattern analysis
GET /api/analyze-patterns
```

---

**The RAG system continuously learns from user editing patterns, making MasterThreader smarter with every script processed.** 🚀 