'use client';

import { useState } from 'react';
import { Thread, MegaPrompt, AppState, RecursionPayload, PromptRule } from '@/types';
import { LandingInterface } from '@/components/LandingInterface';
import { ThreadDisplay } from '@/components/ThreadDisplay';
import { RuleReview } from '@/components/RuleReview';
import { createNewMegaPromptVersion, addMegaPromptVersion } from '@/lib/megaPrompts';

export default function Home() {
  const [appState, setAppState] = useState<AppState>('script-input');
  const [originalScript, setOriginalScript] = useState('');
  const [threads, setThreads] = useState<Thread[]>([]);
  const [megaPrompt, setMegaPrompt] = useState<MegaPrompt | null>(null);
  const [, setIsRecursionLoading] = useState(false);
  const [suggestedRules, setSuggestedRules] = useState<PromptRule[]>([]);
  const [acceptedRules, setAcceptedRules] = useState<PromptRule[]>([]);

  const handleThreadsGenerated = (generatedThreads: Thread[], usedMegaPrompt: MegaPrompt) => {
    setThreads(generatedThreads);
    setMegaPrompt(usedMegaPrompt);
    setAppState('threads-display');
  };

  const handleThreadsUpdated = (updatedThreads: Thread[]) => {
    setThreads(updatedThreads);
  };

  const handleRecursionRequested = async () => {
    if (!megaPrompt) return;

    setIsRecursionLoading(true);
    setAppState('recursion-ui');

    try {
      const payload: RecursionPayload = {
        originalScript,
        threads,
        megaPromptVersion: megaPrompt.version
      };

      const response = await fetch('/api/recursion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Failed to perform recursion');
      }

      const result = await response.json();
      
      // Update threads with recursion results
      setThreads(result.updatedThreads);
      
      // Handle suggested rules
      if (result.suggestedRules && result.suggestedRules.length > 0) {
        setSuggestedRules(result.suggestedRules);
      }
      
      setAppState('refined-threads');
      
    } catch (error) {
      console.error('Recursion failed:', error);
      setAppState('threads-display');
    } finally {
      setIsRecursionLoading(false);
    }
  };

  const handleStartNew = () => {
    setAppState('script-input');
    setOriginalScript('');
    setThreads([]);
    setMegaPrompt(null);
    setSuggestedRules([]);
    setAcceptedRules([]);
  };

  const handleAcceptRule = (rule: PromptRule) => {
    if (!megaPrompt) return;
    
    // Add to accepted rules
    setAcceptedRules(prev => [...prev, rule]);
    
    // Create new mega prompt version with accepted rules
    const newMegaPrompt = createNewMegaPromptVersion(megaPrompt, [rule]);
    addMegaPromptVersion(newMegaPrompt);
    setMegaPrompt(newMegaPrompt);
  };

  const handleSkipRule = (rule: PromptRule) => {
    // Simply remove from suggested rules (do nothing with it)
    setSuggestedRules(prev => prev.filter(r => r.id !== rule.id));
  };

  const handleExport = () => {
    const header = `# Twitter Threads\n\nGenerated using MasterThreader ${megaPrompt?.version || 'v1.0'}\n${acceptedRules.length > 0 ? `Includes ${acceptedRules.length} AI-learned improvements` : ''}\n\n---\n\n`;
    
    const threadsMarkdown = threads.map((thread, index) => {
      const threadStyle = thread.id.includes('story') ? 'Story-Driven' : 
                         thread.id.includes('data') ? 'Data-Driven' : 
                         thread.id.includes('actionable') ? 'Actionable' : 
                         `Thread ${index + 1}`;
      
      return `## ${threadStyle}\n\n${thread.content}\n\n---\n`;
    }).join('\n');

    const markdown = header + threadsMarkdown;

    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'twitter-threads.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">MT</span>
                </div>
                <h1 className="text-xl font-semibold text-gray-900">MasterThreader</h1>
              </div>
              {megaPrompt && (
                <span className="text-sm text-gray-500">
                  v{megaPrompt.version}
                </span>
              )}
              {appState !== 'script-input' && (
                                 <div className="hidden sm:flex items-center space-x-2 text-sm text-gray-500">
                   <span className="text-gray-400">
                     Script
                   </span>
                  <span>→</span>
                  <span className={appState === 'threads-display' ? 'text-blue-600 font-medium' : ''}>
                    Threads
                  </span>
                  <span>→</span>
                  <span className={appState === 'recursion-ui' ? 'text-blue-600 font-medium' : ''}>
                    Recursion
                  </span>
                  <span>→</span>
                  <span className={appState === 'export-ready' ? 'text-blue-600 font-medium' : ''}>
                    Export
                  </span>
                </div>
              )}
            </div>
            <div className="flex items-center space-x-3">
              {appState === 'refined-threads' && (
                <button
                  onClick={handleExport}
                  className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
                >
                  Export Markdown
                </button>
              )}
              {appState !== 'script-input' && (
                <button
                  onClick={handleStartNew}
                  className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  Start New Script
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="py-8">
        {appState === 'script-input' && (
          <LandingInterface 
            onThreadsGenerated={(threads, megaPrompt, originalScript) => {
              setOriginalScript(originalScript);
              handleThreadsGenerated(threads, megaPrompt);
            }} 
          />
        )}

        {(appState === 'threads-display' || appState === 'refined-threads') && (
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <ThreadDisplay
              threads={threads}
              onThreadsUpdated={handleThreadsUpdated}
              onRecursionRequested={handleRecursionRequested}
              scriptTitle={originalScript.trim().split(' ').slice(0, 5).join(' ')}
            />
            
            {/* Rule Review Section - appears after recursion */}
            {appState === 'refined-threads' && suggestedRules.length > 0 && (
              <RuleReview
                suggestedRules={suggestedRules}
                onAcceptRule={handleAcceptRule}
                onSkipRule={handleSkipRule}
                acceptedRules={acceptedRules}
                currentVersion={megaPrompt?.version || 'v1.0'}
              />
            )}
          </div>
        )}

        {appState === 'recursion-ui' && (
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-gray-900">Running Recursion</h2>
              <p className="text-gray-600">
                Analyzing your edits and annotations to improve the threads...
              </p>
            </div>
            <div className="flex justify-center">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
