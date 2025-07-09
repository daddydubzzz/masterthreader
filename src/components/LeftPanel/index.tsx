'use client';

import { LeftPanelProps } from './types';
import { useLeftPanel } from './hooks/useLeftPanel';
import { MegaPromptCard } from './components/MegaPromptCard';

export function LeftPanel({ 
  selectedMegaPrompt, 
  onMegaPromptSelect,
  onMegaPromptChange
}: LeftPanelProps) {
  const {
    megaPrompts,
    handleMegaPromptSelect,
    handleMegaPromptCreate,
    handleMegaPromptEdit,
    handleMegaPromptToggle
  } = useLeftPanel(selectedMegaPrompt, onMegaPromptSelect, onMegaPromptChange);

  return (
    <div className="h-full bg-white border-r border-gray-200 flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-gray-900">MegaPrompts</h2>
        </div>
        <p className="text-sm text-gray-600">Active generation rules and patterns</p>
      </div>

      {/* MegaPrompts List */}
      <div className="flex-1 p-4 space-y-3 overflow-y-auto">
        {megaPrompts.map((megaPrompt) => (
          <MegaPromptCard
            key={megaPrompt.id}
            megaPrompt={megaPrompt}
            isSelected={selectedMegaPrompt === megaPrompt.id}
            onClick={() => handleMegaPromptSelect(megaPrompt.id)}
            onEdit={() => handleMegaPromptEdit(megaPrompt)}
            onToggleActive={() => handleMegaPromptToggle(megaPrompt.id)}
          />
        ))}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <button 
          onClick={handleMegaPromptCreate}
          className="w-full btn btn-ghost text-sm py-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add MegaPrompt
        </button>
      </div>
    </div>
  );
} 