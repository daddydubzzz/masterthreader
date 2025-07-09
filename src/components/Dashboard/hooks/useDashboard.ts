import { useState, useCallback, useEffect } from 'react';
import { Thread, MegaPrompt } from '@/types';
import { MegaPromptItem } from '@/components/LeftPanel/types';
import { UseDashboardReturn } from '../types';
import { 
  saveThreadsToStorage, 
  loadThreadsFromStorage, 
  clearThreadsFromStorage 
} from '@/lib/threadPersistence';

export function useDashboard(): UseDashboardReturn {
  // State management
  const [threads, setThreads] = useState<Thread[]>([]);
  const [megaPrompt, setMegaPrompt] = useState<MegaPrompt | undefined>();
  const [originalScript, setOriginalScript] = useState<string>('');

  // Load persisted threads on mount
  useEffect(() => {
    const persistedData = loadThreadsFromStorage();
    if (persistedData) {
      setThreads(persistedData.threads);
      setMegaPrompt(persistedData.megaPrompt);
      setOriginalScript(persistedData.originalScript);
    }
  }, []);

  // Event handlers
  const handleThreadsGenerated = useCallback((
    newThreads: Thread[], 
    usedMegaPrompt: MegaPrompt, 
    script: string
  ) => {
    setThreads(newThreads);
    setMegaPrompt(usedMegaPrompt);
    setOriginalScript(script);
    
    // Save to localStorage whenever threads are generated or updated
    if (newThreads.length > 0) {
      saveThreadsToStorage(newThreads, usedMegaPrompt, script);
    } else {
      // Clear storage if threads are cleared (e.g., "New Generation" clicked)
      clearThreadsFromStorage();
    }
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