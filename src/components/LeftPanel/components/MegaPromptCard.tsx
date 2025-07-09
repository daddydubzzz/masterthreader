'use client';

import { useState } from 'react';
import { MegaPromptCardProps } from '../types';

export function MegaPromptCard({ 
  megaPrompt, 
  onEdit,
  onToggleActive,
  isReadOnly = false
}: MegaPromptCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="border border-gray-200 rounded-xl bg-white transition-all duration-200">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 text-left hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-gray-900 text-sm">{megaPrompt.name}</h3>
          <div className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}>
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-gray-400">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
        <p className="text-xs text-gray-600 mt-1">{megaPrompt.description}</p>
      </button>

      {/* Expandable Content */}
      {isExpanded && (
        <div className="border-t border-gray-100 p-4 bg-gray-50">
          <div className="text-xs text-gray-700 font-mono whitespace-pre-wrap leading-relaxed max-h-96 overflow-y-auto">
            {megaPrompt.content || 'Loading content...'}
          </div>
        </div>
      )}

      {/* Action buttons - only show if not read-only */}
      {!isReadOnly && isExpanded && (
        <div className="border-t border-gray-100 p-3 bg-gray-50">
          <div className="flex items-center gap-2">
            {onEdit && (
              <button
                onClick={onEdit}
                className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
              >
                Edit
              </button>
            )}
            {onToggleActive && (
              <button
                onClick={onToggleActive}
                className={`px-3 py-1 text-xs rounded transition-colors ${
                  megaPrompt.isActive
                    ? 'bg-red-100 text-red-700 hover:bg-red-200'
                    : 'bg-green-100 text-green-700 hover:bg-green-200'
                }`}
              >
                {megaPrompt.isActive ? 'Deactivate' : 'Activate'}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 