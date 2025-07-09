'use client';

import { useDashboard } from './hooks/useDashboard';
import { LeftPanel } from '@/components/LeftPanel';
import { MiddlePanel } from '@/components/MiddlePanel';
import { RightPanel } from '@/components/RightPanel';

export function Dashboard() {
  const {
    threads,
    megaPrompt,
    originalScript,
    handleThreadsGenerated,
    handleMegaPromptChange
  } = useDashboard();

  return (
    <div className="h-screen overflow-hidden">
      <div className="grid grid-cols-12 h-full">
        {/* Left Panel - MegaPrompts */}
        <div className="col-span-3 border-r border-gray-200">
          <LeftPanel
            onMegaPromptChange={handleMegaPromptChange}
          />
        </div>

        {/* Middle Panel - Main Workspace */}
        <div className="col-span-6 border-r border-gray-200">
          <MiddlePanel
            onThreadsGenerated={handleThreadsGenerated}
          />
        </div>

        {/* Right Panel - AI Learning */}
        <div className="col-span-3">
          <RightPanel
            threads={threads}
            megaPrompt={megaPrompt}
            originalScript={originalScript}
          />
        </div>
      </div>
    </div>
  );
} 