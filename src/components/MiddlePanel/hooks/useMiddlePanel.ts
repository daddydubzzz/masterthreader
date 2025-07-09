import { useState, useCallback } from 'react';
import { Thread, MegaPrompt, GenerationRequest, GenerationResponse } from '@/types';
import { getLatestMegaPrompt } from '@/lib/megaPrompts';
import { UseMiddlePanelReturn, GenerationHistoryItem } from '../types';

export function useMiddlePanel(
  selectedMegaPrompt?: string,
  onThreadsGenerated?: (threads: Thread[], megaPrompt: MegaPrompt, originalScript: string) => void
): UseMiddlePanelReturn {
  // State management
  const [script, setScript] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generationHistory, setGenerationHistory] = useState<GenerationHistoryItem[]>([]);

  // Thread generation logic
  const generateThreads = useCallback(async () => {
    if (!script.trim()) {
      setError('Please enter a script to transform');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      // Use the selected megaprompt or fallback to latest
      const latestMegaPrompt = getLatestMegaPrompt();
      
      const request: GenerationRequest = {
        script: script.trim(),
        megaPromptVersion: latestMegaPrompt.version
      };

      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate threads');
      }

      const data: GenerationResponse = await response.json();
      
      // Add to generation history
      const historyItem: GenerationHistoryItem = {
        id: `gen-${Date.now()}`,
        timestamp: new Date(),
        script: script.trim(),
        megaPromptUsed: selectedMegaPrompt || 'default',
        threadsGenerated: data.threads.length,
        success: true
      };
      
      setGenerationHistory(prev => [historyItem, ...prev.slice(0, 9)]); // Keep last 10

      // Call the callback with the generated threads
      onThreadsGenerated?.(data.threads, data.megaPromptUsed, script);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);

      // Add failed attempt to history
      const historyItem: GenerationHistoryItem = {
        id: `gen-${Date.now()}`,
        timestamp: new Date(),
        script: script.trim(),
        megaPromptUsed: selectedMegaPrompt || 'default',
        threadsGenerated: 0,
        success: false
      };
      
      setGenerationHistory(prev => [historyItem, ...prev.slice(0, 9)]);
    } finally {
      setIsGenerating(false);
    }
  }, [script, selectedMegaPrompt, onThreadsGenerated]);

  // Utility functions
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const clearScript = useCallback(() => {
    setScript('');
    setError(null);
  }, []);

  return {
    script,
    setScript,
    isGenerating,
    error,
    generationHistory,
    generateThreads,
    clearError,
    clearScript
  };
} 