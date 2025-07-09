import { useState, useCallback } from 'react';
import { Thread, MegaPrompt } from '@/types';
import { MegaPromptItem } from '@/components/LeftPanel/types';
import { UseDashboardReturn } from '../types';

export function useDashboard(): UseDashboardReturn {
  // State management
  const [threads, setThreads] = useState<Thread[]>([]);
  const [megaPrompt, setMegaPrompt] = useState<MegaPrompt | undefined>();
  const [originalScript, setOriginalScript] = useState<string>('');

  // Event handlers
  const handleThreadsGenerated = useCallback((
    newThreads: Thread[], 
    usedMegaPrompt: MegaPrompt, 
    script: string
  ) => {
    setThreads(newThreads);
    setMegaPrompt(usedMegaPrompt);
    setOriginalScript(script);
  }, []);

  const handleMegaPromptChange = useCallback((changedMegaPrompt: MegaPromptItem) => {
    // Handle megaprompt changes from left panel
    // This could trigger regeneration or update current megaprompt
    console.log('MegaPrompt changed:', changedMegaPrompt);
  }, []);

  return {
    threads,
    megaPrompt,
    originalScript,
    handleThreadsGenerated,
    handleMegaPromptChange
  };
} 