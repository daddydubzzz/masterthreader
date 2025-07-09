import { useState, useCallback } from 'react';
import { Thread, MegaPrompt } from '@/types';
import { UseDashboardReturn } from '../types';

export function useDashboard(): UseDashboardReturn {
  // Central state management for inter-panel communication
  const [selectedMegaPrompt, setSelectedMegaPrompt] = useState<string | undefined>();
  const [generatedThreads, setGeneratedThreads] = useState<Thread[] | undefined>();
  const [originalScript, setOriginalScript] = useState<string | undefined>();
  const [currentMegaPrompt, setCurrentMegaPrompt] = useState<MegaPrompt | undefined>();

  // Handle megaprompt selection from LeftPanel
  const handleMegaPromptSelect = useCallback((megaPromptId: string) => {
    setSelectedMegaPrompt(megaPromptId);
  }, []);

  // Handle thread generation from MiddlePanel
  const handleThreadsGenerated = useCallback((threads: Thread[], megaPrompt: MegaPrompt, script: string) => {
    setGeneratedThreads(threads);
    setCurrentMegaPrompt(megaPrompt);
    setOriginalScript(script);
  }, []);

  // Handle megaprompt suggestions from RightPanel
  const handleMegaPromptSuggestion = useCallback((suggestion: string) => {
    // TODO: Implement megaprompt updating based on AI suggestions
    console.log('Received megaprompt suggestion:', suggestion);
    // This would integrate with the megaprompt management system
    // to update the selected megaprompt with the suggested improvements
  }, []);

  return {
    selectedMegaPrompt,
    generatedThreads,
    originalScript,
    currentMegaPrompt,
    handleMegaPromptSelect,
    handleThreadsGenerated,
    handleMegaPromptSuggestion
  };
} 