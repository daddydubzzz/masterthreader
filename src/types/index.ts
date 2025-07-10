// Core types for AI Copy Refinement Engine

export interface Thread {
  id: string;
  content: string;
  edits: Edit[];
  annotations: Annotation[];
}

export interface Edit {
  id: string;
  originalText: string;
  editedText: string;
  timestamp: Date;
}

export interface Annotation {
  id: string;
  text: string;
  type: 'improvement' | 'clarification' | 'style';
  timestamp: Date;
}

// Structured thread format for Twitter thread output
export interface StructuredThread {
  title: string;
  tweets: StructuredTweet[];
  conceptBlocksUsed: string[];
}

export interface StructuredTweet {
  content: string;
  characterCount: number;
}

// LLM Response format for thread generation
export interface LLMThreadResponse {
  threads: StructuredThread[];
  conceptBlocks: ConceptBlock[];
}

export interface ConceptBlock {
  id: string;
  content: string;
  used: boolean;
}

// RAG Vector Triple Schema - stores examples for contextualization
export interface VectorTriple {
  id?: string;
  created_at?: Date;
  original_tweet: string;      // The original AI-generated tweet
  annotation: string;          // User feedback/reasoning
  final_edit: string;          // User's final version
  script_title?: string;       // Context for grouping
  position_in_thread?: number; // Position context
  embedding_vector?: number[]; // Full triple embedded together
  quality_rating?: number;     // 1-5, helps surface best examples
  resolved?: boolean;          // Whether this pattern is incorporated
}

export interface VectorTripleQuery {
  query_text: string;
  similarity_threshold?: number;
  limit?: number;
  quality_filter?: number;
  resolved_only?: boolean;
}

export interface SimilarTriple {
  triple: VectorTriple;
  similarity_score: number;
}

export interface RAGAnalysis {
  recurring_patterns: Array<{
    original_tweet: string;
    frequency: number;
    best_example: VectorTriple;
    common_annotations: string[];
  }>;
  best_examples: VectorTriple[];
  contextualization_opportunities: string[];
}

export interface MegaPrompt {
  version: string;
  content: string;
  rules: PromptRule[];
  createdAt: Date;
}

export interface PromptRule {
  id: string;
  content: string;
  category: string;
  accepted: boolean;
  source?: 'user' | 'ai-suggestion';
}

export interface RecursionPayload {
  originalScript: string;
  threads: Thread[];
  megaPromptVersion: string;
  ragContext?: {
    contextualExamples: Array<{
      original: string;
      annotation: string;
      improved: string;
    }>;
    patternContext: string;
    recurringContext: string;
    editsAndAnnotations: string;
  };
}

export interface RecursionResponse {
  updatedThreads: Thread[];
  suggestedRules: PromptRule[];
  improvedMegaPrompt?: MegaPrompt;
}

export interface GenerationRequest {
  script: string;
  megaPromptVersion: string;
}

export interface GenerationResponse {
  threads: Thread[];
  megaPromptUsed: MegaPrompt;
}

// Application State Management
export type AppState = 
  | 'script-input'
  | 'threads-display' 
  | 'recursion-ui'
  | 'refined-threads'
  | 'export-ready';

export interface AppContext {
  state: AppState;
  originalScript: string;
  threads: Thread[];
  megaPrompt: MegaPrompt | null;
  hasEditsOrAnnotations: boolean;
  promptVersions: MegaPrompt[];
  pendingRules: PromptRule[];
  acceptedRules: PromptRule[];
}

// Rule review UI types
export interface RuleReviewProps {
  suggestedRules: PromptRule[];
  onAcceptRule: (rule: PromptRule) => void;
  onSkipRule: (rule: PromptRule) => void;
  acceptedRules: PromptRule[];
  currentVersion: string;
}

export interface RuleCardProps {
  rule: PromptRule;
  onAccept: () => void;
  onSkip: () => void;
  isAccepted?: boolean;
} 