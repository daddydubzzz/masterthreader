import { Thread, MegaPrompt } from '@/types';
import { MegaPromptItem } from '@/components/LeftPanel/types';

// Main Dashboard props
export interface DashboardProps {
  className?: string;
}

// Hook return types
export interface UseDashboardReturn {
  threads: Thread[];
  megaPrompt: MegaPrompt | undefined;
  originalScript: string;
  handleThreadsGenerated: (threads: Thread[], megaPrompt: MegaPrompt, script: string) => void;
  handleMegaPromptChange: (megaPrompt: MegaPromptItem) => void;
} 