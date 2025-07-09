import { useState, useCallback } from 'react';
import { Thread, MegaPrompt, GenerationRequest, GenerationResponse } from '@/types';
import { getLatestMegaPrompt } from '@/lib/megaPrompts';

export interface UseLandingInterfaceReturn {
  script: string;
  setScript: (script: string) => void;
  isGenerating: boolean;
  error: string | null;
  generateThreads: () => Promise<{ threads: Thread[]; megaPrompt: MegaPrompt } | null>;
}

export function useLandingInterface(): UseLandingInterfaceReturn {
  const [script, setScript] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateThreads = useCallback(async () => {
    if (!script.trim()) {
      setError('Please enter a script to transform');
      return null;
    }

    setIsGenerating(true);
    setError(null);

    try {
      // Always use the latest mega prompt version automatically
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
      
      return {
        threads: data.threads,
        megaPrompt: data.megaPromptUsed
      };

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, [script]);

  return {
    script,
    setScript,
    isGenerating,
    error,
    generateThreads
  };
} 