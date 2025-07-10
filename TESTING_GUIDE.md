# MasterThreader Testing Guide
## End-to-End Recursion & Learning System Testing

### 🎯 **Testing Objectives**
1. **Recursion Process**: Immediate thread improvement based on edits
2. **Vector Embeddings**: Pattern storage and retrieval from database
3. **MegaPrompt Evolution**: Version management and rule integration
4. **Learning Pipeline**: Edit capture → Pattern analysis → Future improvement

---

## 🚀 **Phase 1: Basic Recursion Flow**

### **Test Case 1: Simple Edit → Recursion**
```bash
# 1. Generate initial threads
# 2. Make obvious edits (e.g., change tone, fix grammar)
# 3. Click "Improve Current Threads"
# 4. Verify: New threads incorporate your changes
```

**Expected Results:**
- API call to `/api/recursion` succeeds
- Returns `updatedThreads` with improvements
- Threads reflect your specific edits
- UI shows success notification

### **Test Case 2: Multiple Edit Types**
```bash
# Test different edit types:
# - Inline text edits
# - Annotations (improvement/clarification/style)
# - Multiple threads with various changes
```

**Validation Points:**
- All edit types captured correctly
- Temporal pairing works (edits + annotations)
- Recursion incorporates all feedback types

---

## 🧠 **Phase 2: Vector Database & Learning**

### **Test Case 3: Vector Triple Storage**
```bash
# 1. Make edits + annotations
# 2. Start Learning Session
# 3. Check database for stored patterns
```

**Database Verification:**
```sql
-- Check vector triples were stored
SELECT * FROM vector_triples ORDER BY created_at DESC LIMIT 10;

-- Verify embedding generation
SELECT id, original_tweet, final_edit, quality_rating 
FROM vector_triples 
WHERE embedding_vector IS NOT NULL;
```

### **Test Case 4: Pattern Analysis**
```bash
# 1. Create multiple similar edits across sessions
# 2. Trigger pattern analysis
# 3. Verify recurring patterns detected
```

**API Testing:**
```bash
curl -X GET http://localhost:3000/api/analyze-patterns
# Should return recurring_patterns and best_examples
```

---

## 📈 **Phase 3: MegaPrompt Evolution**

### **Test Case 5: Rule Generation**
```bash
# 1. Make consistent style edits (e.g., always shorten sentences)
# 2. Run recursion multiple times
# 3. Check for suggested rules in response
```

**Verification:**
- `suggestedRules` array in recursion response
- Rules reflect actual editing patterns
- Rules have proper categories and reasoning

### **Test Case 6: Version Management**
```bash
# 1. Accept suggested rules
# 2. Verify megaprompt version increments
# 3. Test new generations use updated prompt
```

---

## 🔄 **Phase 4: Full Learning Loop**

### **Test Case 7: Complete Cycle**
```bash
# Session 1:
# 1. Generate threads
# 2. Make consistent edits (e.g., "make more casual")
# 3. Run recursion
# 4. Start learning session
# 5. Accept suggestions

# Session 2:
# 1. Generate new threads with same script
# 2. Verify: Less editing needed (AI learned)
# 3. Check: RAG context includes previous examples
```

---

## 🛠 **Testing Tools & Scripts**

### **Database Inspection Script**
```javascript
// Save as: scripts/inspect-db.js
const { Pool } = require('pg');

async function inspectDatabase() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL
  });
  
  console.log('=== Vector Triples ===');
  const triples = await pool.query(`
    SELECT id, original_tweet, annotation, final_edit, quality_rating, created_at 
    FROM vector_triples 
    ORDER BY created_at DESC 
    LIMIT 5
  `);
  console.table(triples.rows);
  
  console.log('=== Pattern Analysis ===');
  const patterns = await pool.query(`
    SELECT original_tweet, COUNT(*) as frequency 
    FROM vector_triples 
    GROUP BY original_tweet 
    HAVING COUNT(*) > 1 
    ORDER BY frequency DESC
  `);
  console.table(patterns.rows);
  
  await pool.end();
}

inspectDatabase().catch(console.error);
```

### **API Testing Script**
```bash
# Save as: scripts/test-apis.sh
#!/bin/bash

echo "Testing Generation API..."
curl -X POST http://localhost:3000/api/generate \
  -H "Content-Type: application/json" \
  -d '{"script":"Test script for API","megaPromptVersion":"v1"}' \
  | jq '.'

echo "Testing Pattern Analysis..."
curl -X GET http://localhost:3000/api/analyze-patterns | jq '.'

echo "Testing Vector Capture..."
curl -X POST http://localhost:3000/api/capture-edit \
  -H "Content-Type: application/json" \
  -d '{
    "original_tweet":"Original text",
    "annotation":"Test feedback",
    "final_edit":"Improved text",
    "quality_rating":4
  }' | jq '.'
```

---

## 📋 **Manual Testing Checklist**

### **UI/UX Testing**
- [ ] Export button downloads correct format
- [ ] "Generate More" creates variations
- [ ] "New Script" clears state properly
- [ ] Threads collapse/expand correctly
- [ ] Notifications appear for all actions
- [ ] Error states handled gracefully

### **Recursion Testing**
- [ ] Button only appears after edits
- [ ] Loading states work correctly
- [ ] Success/error notifications
- [ ] Updated threads replace originals
- [ ] Maintains thread formatting (em-dashes)

### **Learning Session Testing**
- [ ] Button only enabled with edits
- [ ] Session status indicators work
- [ ] Pattern analysis completes
- [ ] Suggestions generated
- [ ] Accept/reject functionality

### **Data Persistence**
- [ ] Threads persist in localStorage
- [ ] Vector triples stored in database
- [ ] Embeddings generated correctly
- [ ] Pattern analysis retrieves data

---

## 🔍 **Advanced Testing Scenarios**

### **Scenario A: Style Consistency Learning**
```
1. Generate threads about "productivity tips"
2. Consistently edit to:
   - Remove jargon
   - Add specific examples
   - Shorten sentences
3. Run recursion + learning
4. Generate new "productivity tips" threads
5. Verify: New threads already match your style
```

### **Scenario B: Domain-Specific Improvement**
```
1. Test with technical content
2. Edit for clarity and accessibility
3. Store patterns
4. Test with similar technical content
5. Verify: RAG system provides relevant examples
```

### **Scenario C: Error Recovery**
```
1. Test with malformed API responses
2. Test with database connection issues
3. Test with invalid edit data
4. Verify: Graceful fallbacks and user feedback
```

---

## 📊 **Success Metrics**

### **Quantitative**
- **Recursion Success Rate**: >95% API calls succeed
- **Pattern Storage**: 100% of edit-annotation pairs stored
- **Embedding Generation**: All stored triples have embeddings
- **Response Time**: <10s for recursion, <5s for patterns

### **Qualitative**
- **Thread Quality**: Recursion output noticeably better
- **Learning Effectiveness**: Fewer edits needed over time
- **Pattern Relevance**: Suggested rules make sense
- **User Experience**: Smooth, intuitive workflow

---

## 🚨 **Common Issues & Debugging**

### **Recursion Fails**
```bash
# Check logs
npm run dev
# Look for API errors in terminal

# Test LLM connection
curl -X POST http://localhost:3000/api/generate \
  -H "Content-Type: application/json" \
  -d '{"script":"test","megaPromptVersion":"v1"}'
```

### **Vector Storage Issues**
```sql
-- Check database connection
SELECT NOW();

-- Verify table structure
\d vector_triples

-- Check for embedding issues
SELECT COUNT(*) as total, 
       COUNT(embedding_vector) as with_embeddings 
FROM vector_triples;
```

### **Pattern Analysis Empty**
```javascript
// Check if data exists
const { getRecurringPatterns } = require('./src/lib/vectorDB');
getRecurringPatterns(5).then(console.log);
```

---

## 🎯 **Pre-Client Handoff Checklist**

- [ ] All API endpoints tested and working
- [ ] Database schema deployed and populated
- [ ] Vector embeddings generating correctly
- [ ] Learning loop completes end-to-end
- [ ] Error handling covers edge cases
- [ ] Performance meets requirements
- [ ] UI provides clear feedback
- [ ] Documentation complete

**Ready for client training when all tests pass!** 🚀 