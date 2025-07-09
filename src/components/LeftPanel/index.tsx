'use client';

import { LeftPanelProps } from './types';
import { useLeftPanel } from './hooks/useLeftPanel';
import { MegaPromptCard } from './components/MegaPromptCard';

export function LeftPanel({ onMegaPromptChange }: LeftPanelProps) {
  const {
    megaPrompts,
    handleMegaPromptEdit,
    handleMegaPromptToggle,
  } = useLeftPanel(onMegaPromptChange);

  return (
    <div className="h-full bg-gray-50 border-r border-gray-200">
      {/* MegaPrompts List */}
      <div className="p-4 space-y-3 overflow-y-auto">
        {megaPrompts.map((megaPrompt) => (
          <MegaPromptCard
            key={megaPrompt.id}
            megaPrompt={megaPrompt}
            onEdit={() => handleMegaPromptEdit(megaPrompt)}
            onToggleActive={() => handleMegaPromptToggle(megaPrompt.id)}
            isReadOnly={true}
          />
        ))}
      </div>
    </div>
  );
} 