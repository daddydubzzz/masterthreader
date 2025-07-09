'use client';

import { MegaPromptCardProps } from '../types';

export function MegaPromptCard({ 
  megaPrompt, 
  isSelected, 
  onClick,
  onEdit,
  onToggleActive 
}: MegaPromptCardProps) {
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'core': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'style': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'advanced': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'examples': return 'bg-amber-50 text-amber-700 border-amber-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const formatDate = (date?: Date) => {
    if (!date) return '';
    return new Intl.DateTimeFormat('en-US', { 
      month: 'short', 
      day: 'numeric' 
    }).format(date);
  };

  return (
    <div
      onClick={onClick}
      className={`card-hover cursor-pointer p-4 rounded-xl border transition-all duration-200 ${
        isSelected 
          ? 'ring-2 ring-blue-500 border-blue-200 bg-blue-50' 
          : 'border-gray-200 hover:border-gray-300'
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-medium text-gray-900 text-sm">{megaPrompt.name}</h3>
        <div className="flex items-center gap-2">
          {megaPrompt.isActive && (
            <div className="w-2 h-2 bg-emerald-500 rounded-full" title="Active"></div>
          )}
          <span className={`px-2 py-1 text-xs rounded-full border ${getCategoryColor(megaPrompt.category)}`}>
            {megaPrompt.category}
          </span>
        </div>
      </div>

      {/* Description */}
      <p className="text-xs text-gray-600 leading-relaxed mb-3">{megaPrompt.description}</p>

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center gap-2">
          {megaPrompt.version && (
            <span className="bg-gray-100 px-2 py-1 rounded">v{megaPrompt.version}</span>
          )}
          {megaPrompt.lastModified && (
            <span>{formatDate(megaPrompt.lastModified)}</span>
          )}
        </div>
        
        {/* Action buttons */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {onEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              className="p-1 hover:bg-gray-100 rounded"
              title="Edit megaprompt"
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
          )}
          {onToggleActive && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleActive();
              }}
              className="p-1 hover:bg-gray-100 rounded"
              title={megaPrompt.isActive ? "Deactivate" : "Activate"}
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
} 