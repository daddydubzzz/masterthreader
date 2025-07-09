'use client';

import { LeftPanelProps } from './types';
import { useLeftPanel } from './hooks/useLeftPanel';
import { MegaPromptCard } from './components/MegaPromptCard';

export function LeftPanel({ onMegaPromptChange }: LeftPanelProps) {
  const {
    megaPrompts,
    activeMegaPrompts,
    handleMegaPromptEdit,
    handleMegaPromptToggle,
  } = useLeftPanel(onMegaPromptChange);

  return (
    <div className="h-full bg-gray-50 border-r border-gray-200">
      {/* Header */}
      <div className="sticky top-0 bg-white/80 backdrop-blur-sm border-b border-gray-200 p-4 z-10">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18.999 7.5 18.999s3.332-.522 4.5-1.246m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18.999 16.5 18.999c-1.746 0-3.332-.522-4.5-1.246" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-gray-900">MegaPrompts</h2>
        </div>
        <p className="text-sm text-gray-600">Active generation rules and patterns</p>
        
        {/* Active Count */}
        <div className="mt-3 flex items-center gap-2">
          <div className="text-xs text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full border border-emerald-200">
            {activeMegaPrompts.length} Active
          </div>
          <div className="text-xs text-gray-500">
            {megaPrompts.length - activeMegaPrompts.length} Inactive
          </div>
        </div>
      </div>

      {/* MegaPrompts List */}
      <div className="p-4 space-y-3 overflow-y-auto">
        {megaPrompts.map((megaPrompt) => (
          <MegaPromptCard
            key={megaPrompt.id}
            megaPrompt={megaPrompt}
            onEdit={() => handleMegaPromptEdit(megaPrompt)}
            onToggleActive={() => handleMegaPromptToggle(megaPrompt.id)}
          />
        ))}
      </div>

      {/* Footer Info */}
      <div className="sticky bottom-0 bg-white/80 backdrop-blur-sm border-t border-gray-200 p-4">
        <div className="text-xs text-gray-500 space-y-1">
          <p className="flex items-center gap-1">
            <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
            Active prompts will be used together
          </p>
          <p>Toggle prompts on/off as needed</p>
        </div>
      </div>
    </div>
  );
} 