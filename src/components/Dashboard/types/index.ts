import { Thread, MegaPrompt } from '@/types';

// Main Dashboard props
export interface DashboardProps {
  className?: string;
}

// Dashboard state management
export interface DashboardState {
  selectedMegaPrompt?: string;
  generatedThreads?: Thread[];
  originalScript?: string;
  currentMegaPrompt?: MegaPrompt;
}

// Hook return types
export interface UseDashboardReturn {
  selectedMegaPrompt?: string;
  generatedThreads?: Thread[];
  originalScript?: string;
  currentMegaPrompt?: MegaPrompt;
  handleMegaPromptSelect: (megaPromptId: string) => void;
  handleThreadsGenerated: (threads: Thread[], megaPrompt: MegaPrompt, script: string) => void;
  handleMegaPromptSuggestion: (suggestion: string) => void;
} 