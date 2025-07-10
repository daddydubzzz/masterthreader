'use client';

import { useState, useEffect } from 'react';
import { MiddlePanelProps } from './types';
import { ScriptInput } from '@/components/LandingInterface/components/ScriptInput';
import { GenerateButton } from '@/components/LandingInterface/components/GenerateButton';
import { ThreadDisplay } from '@/components/ThreadDisplay';
import { useMiddlePanel } from './hooks/useMiddlePanel';
import { hasPersistedThreads } from '@/lib/threadPersistence';
import { showNotification } from '@/utils/notifications';

export function MiddlePanel({ threads, originalScript, onThreadsGenerated }: MiddlePanelProps) {
  const [showRestoredMessage, setShowRestoredMessage] = useState(false);
  
  const {
    script,
    setScript,
    isGenerating,
    error,
    generateThreads
  } = useMiddlePanel(undefined, onThreadsGenerated);

  // Check if threads were restored from storage
  useEffect(() => {
    if (threads && threads.length > 0 && hasPersistedThreads()) {
      setShowRestoredMessage(true);
      // Hide message after 5 seconds
      const timer = setTimeout(() => {
        setShowRestoredMessage(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [threads]);

  const handleGenerate = async () => {
    await generateThreads();
    // Result handling is already done in the hook via callback
  };

  const handleRegenerateThreads = async () => {
    if (!originalScript) return;
    
    // Temporarily set script to original script for regeneration
    const currentScript = script;
    setScript(originalScript);
    
    try {
      await generateThreads();
      // Result handling is already done in the hook via callback
    } finally {
      // Restore original script state
      setScript(currentScript);
    }
  };

  const hasGeneratedThreads = threads && threads.length > 0;

  return (
    <div className="h-full bg-white flex flex-col">
      {/* Restored Message */}
      {showRestoredMessage && (
        <div className="bg-emerald-50 border border-emerald-200 p-3 mx-4 mt-4 rounded-lg animate-slide-up">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-emerald-100 rounded-full flex items-center justify-center">
              <svg className="w-3 h-3 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span className="text-sm text-emerald-700">
              Your previous threads have been restored
            </span>
            <button 
              onClick={() => setShowRestoredMessage(false)}
              className="ml-auto text-emerald-600 hover:text-emerald-700"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}



      {/* Content */}
      <div className="flex-1">
        {hasGeneratedThreads ? (
          /* Thread Display State */
          <ThreadDisplay
            threads={threads}
            onThreadsUpdated={(updatedThreads) => {
              // Update threads with edits/annotations
              onThreadsGenerated(updatedThreads, { version: '', content: '', rules: [], createdAt: new Date() }, originalScript || '');
            }}
            onRegenerateThreads={handleRegenerateThreads}
            onRecursionRequested={async () => {
              // Handle recursion request
              console.log('Recursion requested with threads:', threads);
              
              if (!threads || !originalScript) {
                console.error('Missing threads or original script for recursion');
                return;
              }

              // Check if there are edits or annotations to learn from
              const hasEditsFeedback = threads.some(thread => 
                thread.edits.length > 0 || thread.annotations.length > 0
              );

              if (!hasEditsFeedback) {
                console.warn('No edits or annotations found for recursion');
                return;
              }

              try {
                // Call the recursion API
                const response = await fetch('/api/recursion', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    originalScript,
                    threads,
                    megaPromptVersion: 'v1' // Use current version
                  }),
                });

                if (!response.ok) {
                  const errorData = await response.json();
                  throw new Error(errorData.error || `Recursion failed: ${response.statusText}`);
                }

                const recursionResult = await response.json();
                
                // Update threads with the recursion results
                if (recursionResult.updatedThreads) {
                  onThreadsGenerated(
                    recursionResult.updatedThreads, 
                    { version: 'v1', content: '', rules: recursionResult.suggestedRules || [], createdAt: new Date() }, 
                    originalScript
                  );
                }

                console.log('Recursion completed successfully:', recursionResult);
              } catch (error) {
                console.error('Recursion error:', error);
                
                // Show user-friendly error message
                showNotification(
                  error instanceof Error ? error.message : 'Recursion failed. Please try again.',
                  'error',
                  5000
                );
              }
            }}
            scriptTitle={originalScript ? originalScript.slice(0, 50) + '...' : undefined}
          />
        ) : (
          /* Input State */
          <div className="p-4">
            <div className="max-w-4xl mx-auto space-y-6">
              {/* Script Input */}
              <div className="space-y-4">
                <ScriptInput
                  value={script}
                  onChange={setScript}
                  disabled={isGenerating}
                  placeholder="Paste your script, blog post, or any content here to transform into engaging Twitter threads..."
                />
              </div>

              {/* Error Display */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-6 animate-slide-up">
                  <div className="flex items-start gap-4">
                    <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-4 h-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-red-800 mb-2">
                        Generation Failed
                      </h3>
                      <p className="text-sm text-red-700 leading-relaxed">
                        {error}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Generate Button */}
              <div className="flex justify-center pt-4">
                <GenerateButton
                  onClick={handleGenerate}
                  isLoading={isGenerating}
                  disabled={!script.trim()}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 