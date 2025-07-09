'use client';

import { DashboardProps } from './types';
import { useDashboard } from './hooks/useDashboard';
import { LeftPanel } from '@/components/LeftPanel';
import { MiddlePanel } from '@/components/MiddlePanel';
import { RightPanel } from '@/components/RightPanel';

export function Dashboard({ className = '' }: DashboardProps) {
  const {
    selectedMegaPrompt,
    generatedThreads,
    originalScript,
    handleMegaPromptSelect,
    handleThreadsGenerated,
    handleMegaPromptSuggestion
  } = useDashboard();

  return (
    <div className={`h-screen flex bg-gray-50 ${className}`}>
      {/* Left Panel - MegaPrompts */}
      <div className="w-80 flex-shrink-0 hidden lg:block">
        <LeftPanel
          selectedMegaPrompt={selectedMegaPrompt}
          onMegaPromptSelect={handleMegaPromptSelect}
        />
      </div>

      {/* Middle Panel - Script Workspace */}
      <div className="flex-1 min-w-0">
        <MiddlePanel
          selectedMegaPrompt={selectedMegaPrompt}
          onThreadsGenerated={handleThreadsGenerated}
        />
      </div>

      {/* Right Panel - AI Learning */}
      <div className="w-80 flex-shrink-0 hidden xl:block">
        <RightPanel
          generatedThreads={generatedThreads}
          originalScript={originalScript}
          selectedMegaPrompt={selectedMegaPrompt}
          onMegaPromptSuggestion={handleMegaPromptSuggestion}
        />
      </div>

      {/* Mobile/Tablet Panel Selector */}
      <div className="lg:hidden xl:hidden fixed bottom-4 left-4 right-4 z-50">
        <div className="bg-white border border-gray-200 rounded-2xl shadow-lg p-3">
          <div className="flex items-center justify-around text-xs">
            <button className="flex flex-col items-center gap-1 p-2 text-blue-600">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>Prompts</span>
            </button>
            <button className="flex flex-col items-center gap-1 p-2 text-emerald-600">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
              <span>Workspace</span>
            </button>
            <button className="flex flex-col items-center gap-1 p-2 text-purple-600">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              <span>AI</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 