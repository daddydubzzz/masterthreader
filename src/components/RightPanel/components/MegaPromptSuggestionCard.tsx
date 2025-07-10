'use client';

import { useState } from 'react';
import { MegaPromptSuggestion } from '@/lib/megaPromptVersioning';

interface MegaPromptSuggestionCardProps {
  suggestion: MegaPromptSuggestion;
  onAccept: (suggestionId: string, description?: string) => void;
  onReject: (suggestionId: string) => void;
}

export function MegaPromptSuggestionCard({
  suggestion,
  onAccept,
  onReject
}: MegaPromptSuggestionCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [customDescription, setCustomDescription] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleAccept = async () => {
    setIsProcessing(true);
    try {
      await onAccept(suggestion.id, customDescription || undefined);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    setIsProcessing(true);
    try {
      await onReject(suggestion.id);
    } finally {
      setIsProcessing(false);
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600 bg-green-100';
    if (confidence >= 0.6) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getFileIcon = (file: string) => {
    switch (file) {
      case 'core': return '🎯';
      case 'style': return '✨';
      case 'examples': return '📚';
      case 'advanced': return '🔧';
      default: return '📄';
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getConfidenceColor(suggestion.confidence)}`}>
              {Math.round(suggestion.confidence * 100)}% confidence
            </span>
            <span className="text-xs text-gray-500">
              {suggestion.basedOnPatterns.length} pattern{suggestion.basedOnPatterns.length !== 1 ? 's' : ''}
            </span>
          </div>
          <h3 className="text-sm font-medium text-gray-900 mb-1">
            {suggestion.reasoning}
          </h3>
          <p className="text-xs text-gray-600">
            {suggestion.previewContent}
          </p>
        </div>
        
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="ml-2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg 
            className={`w-4 h-4 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="space-y-3 mb-4">
          {/* Changes Preview */}
          <div className="bg-gray-50 rounded-lg p-3">
            <h4 className="text-xs font-medium text-gray-700 mb-2">Proposed Changes:</h4>
            <div className="space-y-2">
              {suggestion.changes.map((change) => (
                <div key={change.id} className="text-xs">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">{getFileIcon(change.file)} {change.file}</span>
                    <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${
                      change.type === 'addition' ? 'bg-green-100 text-green-700' :
                      change.type === 'modification' ? 'bg-blue-100 text-blue-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {change.type}
                    </span>
                    {change.section && (
                      <span className="text-gray-500">→ {change.section}</span>
                    )}
                  </div>
                  <div className="bg-white rounded border p-2 ml-4">
                    <p className="text-gray-700 whitespace-pre-wrap">{change.newContent}</p>
                  </div>
                  <p className="text-gray-500 ml-4 mt-1">{change.reasoning}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Based on Patterns */}
          <div className="bg-blue-50 rounded-lg p-3">
            <h4 className="text-xs font-medium text-blue-700 mb-2">Based on these patterns:</h4>
            <div className="space-y-1">
              {suggestion.basedOnPatterns.map((pattern, index) => (
                                  <div key={index} className="text-xs text-blue-600 bg-white rounded px-2 py-1">
                    &quot;{pattern}&quot;
                </div>
              ))}
            </div>
          </div>

          {/* Custom Description */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Custom Description (optional):
            </label>
            <input
              type="text"
              value={customDescription}
              onChange={(e) => setCustomDescription(e.target.value)}
              placeholder="Describe this change..."
              className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={handleAccept}
          disabled={isProcessing}
          className="flex-1 px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isProcessing ? 'Applying...' : 'Accept & Apply'}
        </button>
        <button
          onClick={handleReject}
          disabled={isProcessing}
          className="flex-1 px-3 py-1.5 bg-gray-600 text-white text-xs font-medium rounded hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isProcessing ? 'Processing...' : 'Reject'}
        </button>
      </div>
    </div>
  );
} 