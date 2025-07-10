import { Thread, MegaPrompt } from '@/types';
import { MegaPromptSuggestion as VersioningSuggestion, MegaPromptVersion } from '@/lib/megaPromptVersioning';

// Main RightPanel props
export interface RightPanelProps {
  threads?: Thread[];
  megaPrompt?: MegaPrompt;
  originalScript?: string;
}

// AI Training and Learning types
export interface EditCapture {
  id: string;
  timestamp: Date;
  threadId: string;
  originalText: string;
  editedText: string;
  editType: 'inline' | 'annotation' | 'deletion' | 'addition';
  context: string;
  userComment?: string;
}

export interface LearningPattern {
  id: string;
  patternType: 'style' | 'structure' | 'engagement' | 'formatting';
  description: string;
  examples: string[];
  confidence: number;
  frequency: number;
  lastSeen: Date;
}

export interface MegaPromptSuggestion {
  id: string;
  type: 'addition' | 'modification' | 'removal';
  category: 'core' | 'style' | 'advanced' | 'examples';
  currentRule?: string;
  suggestedRule: string;
  reasoning: string;
  basedOnEdits: string[];
  confidence: number;
  priority: 'high' | 'medium' | 'low';
}

export interface TrainingSession {
  id: string;
  startTime: Date;
  endTime?: Date;
  editsCount: number;
  patternsIdentified: number;
  suggestionsGenerated: number;
  scriptsProcessed: string[];
}

// Component props
export interface EditCaptureCardProps {
  edit: EditCapture;
  onApprove: () => void;
  onReject: () => void;
  onComment: (comment: string) => void;
}

export interface LearningPatternCardProps {
  pattern: LearningPattern;
  onApply: () => void;
  onDismiss: () => void;
}

export interface SuggestionCardProps {
  suggestion: MegaPromptSuggestion;
  onAccept: () => void;
  onReject: () => void;
  onModify: (modifiedRule: string) => void;
}

// Hook return types
export interface UseRightPanelReturn {
  editCaptures: EditCapture[];
  learningPatterns: LearningPattern[];
  suggestions: MegaPromptSuggestion[];
  megaPromptSuggestions: VersioningSuggestion[];
  versionHistory: MegaPromptVersion[];
  currentSession: TrainingSession | null;
  isProcessing: boolean;
  captureEdit: (edit: Omit<EditCapture, 'id' | 'timestamp'>) => void;
  processThreadAnnotations: (threads: Thread[]) => Promise<void>;
  generateSuggestions: () => Promise<void>;
  generateMegaPromptSuggestions: () => Promise<void>;
  acceptMegaPromptSuggestion: (suggestionId: string, description?: string) => Promise<void>;
  rejectMegaPromptSuggestion: (suggestionId: string) => Promise<void>;
  rollbackToVersion: (versionId: string) => Promise<void>;
  applyPattern: (patternId: string) => void;
  acceptSuggestion: (suggestionId: string) => Promise<void>;
  rejectSuggestion: (suggestionId: string) => void;
  startTrainingSession: () => void;
  endTrainingSession: () => void;
} 