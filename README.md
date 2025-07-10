# MasterThreader

**AI-Powered Twitter Thread Generation & Refinement System**

Transform your scripts into high-quality Twitter threads with intelligent AI generation, recursive improvement, and continuous learning from your editing patterns.

## 🚀 Features

- **Intelligent Thread Generation**: Convert scripts into engaging Twitter threads using advanced AI
- **Recursive Improvement**: Iteratively refine threads based on your edits and feedback
- **Learning System**: Continuously improves output quality by learning from your editing patterns
- **Vector Database**: Stores and retrieves contextual examples for better AI generation
- **MegaPrompt Evolution**: Automatically suggests improvements to generation prompts
- **Export Functionality**: Download threads in various formats for easy posting

## 🏗️ Architecture

MasterThreader is built with:
- **Frontend**: Next.js 15 with TypeScript and Tailwind CSS
- **Backend**: Node.js API routes with PostgreSQL + pgvector
- **AI Integration**: OpenAI/Anthropic LLM clients with RAG enhancement
- **Learning Engine**: Vector embeddings for pattern recognition and improvement

## 📦 Installation

### Prerequisites
- Node.js 18+
- PostgreSQL with pgvector extension
- OpenAI or Anthropic API key

### Setup

1. **Clone the repository**
```bash
git clone <repository-url>
cd MasterThreader
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up the database**
```bash
# Install PostgreSQL and pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

# Run the schema
psql -d your_database -f database/schema.sql
```

4. **Configure environment variables**
```bash
# Create .env.local file
DATABASE_URL=postgresql://user:password@localhost:5432/masterthreader
OPENAI_API_KEY=sk-...
LLM_PROVIDER=openai  # or anthropic
```

5. **Start the development server**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to access MasterThreader.

## 🎯 Usage

### Basic Workflow

1. **Input Script**: Enter your content script or outline
2. **Generate Threads**: AI creates initial Twitter thread versions
3. **Edit & Annotate**: Make improvements and add feedback notes
4. **Recursive Improvement**: Click "Improve Current Threads" for AI refinement
5. **Start Learning**: Store patterns in the vector database for future improvement
6. **Export**: Download your polished threads

### Advanced Features

#### Learning System
- **Pattern Recognition**: Automatically identifies recurring editing patterns
- **Contextual Examples**: Uses past edits to improve future generations
- **Quality Ratings**: Tracks and prioritizes high-quality examples

#### MegaPrompt Evolution
- **Smart Suggestions**: Proposes prompt improvements based on your editing patterns
- **Version Control**: Maintains versioned snapshots of all prompt modifications
- **User Approval**: Requires explicit confirmation before applying changes

## 🧪 Testing

### Quick Test Suite
```bash
# Test all APIs
npm run test:api

# Check database health
npm run test:db

# Run learning loop test
npm run test:learning

# Run all tests
npm run test:all
```

### Manual Testing
See [TESTING_GUIDE.md](TESTING_GUIDE.md) for comprehensive testing procedures.

## 📊 API Endpoints

- `POST /api/generate` - Generate threads from script
- `POST /api/recursion` - Improve threads based on edits
- `POST /api/capture-edit` - Store editing patterns
- `GET /api/analyze-patterns` - Analyze recurring patterns
- `POST /api/megaprompt-suggestions` - Manage prompt evolution

## 🔧 Configuration

### Environment Variables
```bash
DATABASE_URL=postgresql://...          # PostgreSQL connection string
OPENAI_API_KEY=sk-...                 # OpenAI API key
ANTHROPIC_API_KEY=sk-ant-...          # Anthropic API key (optional)
LLM_PROVIDER=openai                   # Primary LLM provider
```

### Database Configuration
The system uses PostgreSQL with pgvector for semantic search capabilities. See [README_VECTOR_DB.md](README_VECTOR_DB.md) for detailed database documentation.

## 📈 Performance

- **Thread Generation**: < 15 seconds
- **Recursive Improvement**: < 10 seconds
- **Pattern Analysis**: < 5 seconds
- **Database Queries**: < 2 seconds

## 🛡️ Security & Privacy

- Environment variable protection for API keys
- Database connection pooling for performance
- No personal data storage - only editing patterns
- Graceful error handling and validation

## 🔮 Future Enhancements

- **Automatic Quality Rating**: AI-powered assessment of thread quality
- **Pattern Consolidation**: Intelligent merging of similar patterns
- **Performance Optimization**: Enhanced caching and query optimization
- **Advanced Analytics**: Detailed metrics and improvement tracking

## 📚 Documentation

- [Vector Database System](README_VECTOR_DB.md) - RAG and learning architecture
- [Testing Guide](TESTING_GUIDE.md) - Comprehensive testing procedures
- [Production Checklist](PRODUCTION_CHECKLIST.md) - Deployment readiness

## 🤝 Contributing

MasterThreader is designed to be extensible and maintainable. Key areas for contribution:
- AI prompt optimization
- UI/UX improvements
- Performance enhancements
- Additional export formats

## 📄 License

This project is licensed under the MIT License.

---

**MasterThreader: Where AI meets human creativity to produce exceptional Twitter threads.**
