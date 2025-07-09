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
    <div className="min-h-screen bg-gradient-to-br from-gray-25 via-white to-gray-50">
      {/* Navigation */}
      <nav className="nav-glass">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold text-sm tracking-tight">MT</span>
                  </div>
                  <div className="absolute -inset-1 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl opacity-20 blur-sm"></div>
                </div>
                <div>
                  <h1 className="text-xl font-semibold gradient-text tracking-tight">MasterThreader</h1>
                  {megaPrompt && (
                    <span className="text-xs text-gray-500 font-medium">
                      v{megaPrompt.version}
                    </span>
                  )}
                </div>
              </div>
              
              {appState !== 'script-input' && (
                <div className="hidden lg:flex items-center space-x-3">
                  <div className="flex items-center space-x-2 text-sm">
                    <div className="flex items-center space-x-1.5">
                      <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                      <span className="text-gray-600 font-medium">Script</span>
                    </div>
                    <svg className="w-4 h-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    <div className="flex items-center space-x-1.5">
                      <div className={`w-2 h-2 rounded-full ${appState === 'threads-display' || appState === 'refined-threads' ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
                      <span className={`font-medium ${appState === 'threads-display' || appState === 'refined-threads' ? 'text-blue-600' : 'text-gray-500'}`}>
                        Threads
                      </span>
                    </div>
                    <svg className="w-4 h-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    <div className="flex items-center space-x-1.5">
                      <div className={`w-2 h-2 rounded-full ${appState === 'recursion-ui' ? 'bg-amber-500' : 'bg-gray-300'}`}></div>
                      <span className={`font-medium ${appState === 'recursion-ui' ? 'text-amber-600' : 'text-gray-500'}`}>
                        Recursion
                      </span>
                    </div>
                    <svg className="w-4 h-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    <div className="flex items-center space-x-1.5">
                      <div className={`w-2 h-2 rounded-full ${appState === 'export-ready' || appState === 'refined-threads' ? 'bg-emerald-500' : 'bg-gray-300'}`}></div>
                      <span className={`font-medium ${appState === 'export-ready' || appState === 'refined-threads' ? 'text-emerald-600' : 'text-gray-500'}`}>
                        Export
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex items-center space-x-3">
              {appState === 'refined-threads' && (
                <button
                  onClick={handleExport}
                  className="btn btn-success animate-scale-in"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Export Markdown
                </button>
              )}
              {appState !== 'script-input' && (
                <button
                  onClick={handleStartNew}
                  className="btn btn-secondary"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Start New
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-16 pb-8 min-h-screen">
        <div className="animate-fade-in">
          {appState === 'script-input' && (
            <LandingInterface 
              onThreadsGenerated={(threads, megaPrompt, originalScript) => {
                setOriginalScript(originalScript);
                handleThreadsGenerated(threads, megaPrompt);
              }} 
            />
          )}

          {(appState === 'threads-display' || appState === 'refined-threads') && (
            <div className="animate-slide-up">
              <ThreadDisplay
                threads={threads}
                onThreadsUpdated={handleThreadsUpdated}
                onRecursionRequested={handleRecursionRequested}
                scriptTitle={originalScript.trim().split(' ').slice(0, 5).join(' ')}
              />
              
              {/* Rule Review Section - appears after recursion */}
              {appState === 'refined-threads' && suggestedRules.length > 0 && (
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
                  <RuleReview
                    suggestedRules={suggestedRules}
                    onAcceptRule={handleAcceptRule}
                    onSkipRule={handleSkipRule}
                    acceptedRules={acceptedRules}
                    currentVersion={megaPrompt?.version || 'v1.0'}
                  />
                </div>
              )}
            </div>
          )}

          {appState === 'recursion-ui' && (
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center animate-slide-up">
              <div className="card-premium rounded-3xl p-12 max-w-md mx-auto">
                <div className="space-y-6">
                  <div className="relative">
                    <div className="w-16 h-16 mx-auto spinner"></div>
                    <div className="absolute inset-0 w-16 h-16 mx-auto rounded-full bg-gradient-to-r from-blue-500 to-purple-500 opacity-20 animate-pulse"></div>
                  </div>
                  <div className="space-y-3">
                    <h2 className="text-2xl font-bold gradient-text">Running Recursion</h2>
                    <p className="text-gray-600 leading-relaxed">
                      Analyzing your edits and annotations to improve the threads with AI-powered refinements...
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
