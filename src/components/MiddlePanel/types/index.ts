import { Thread, MegaPrompt } from '@/types';

// Main MiddlePanel props
export interface MiddlePanelProps {
  threads?: Thread[];
  originalScript?: string;
  onThreadsGenerated: (threads: Thread[], megaPrompt: MegaPrompt, originalScript: string) => void;
}

// Script workspace types
export interface ScriptWorkspaceState {
  script: string;
  isGenerating: boolean;
  error: string | null;
  generationHistory: GenerationHistoryItem[];
}

export interface GenerationHistoryItem {
  id: string;
  timestamp: Date;
  script: string;
  megaPromptUsed: string;
  threadsGenerated: number;
  success: boolean;
}

// Hook return types
export interface UseMiddlePanelReturn {
  script: string;
  setScript: (script: string) => void;
  isGenerating: boolean;
  error: string | null;
  generationHistory: GenerationHistoryItem[];
  generateThreads: () => Promise<{ threads: Thread[]; megaPrompt: MegaPrompt; } | null>;
  clearError: () => void;
  clearScript: () => void;
} 