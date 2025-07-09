import { Thread, MegaPrompt } from '@/types';

export interface LandingInterfaceProps {
  onThreadsGenerated: (threads: Thread[], megaPrompt: MegaPrompt, originalScript: string) => void;
}

export interface ScriptInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export interface MegaPromptSelectorProps {
  selectedVersion: string;
  onVersionChange: (version: string) => void;
  availableVersions: string[];
  disabled?: boolean;
}

export interface GenerateButtonProps {
  onClick: () => void;
  isLoading?: boolean;
  disabled?: boolean;
} 