'use client';

import { SuggestionCardProps } from '../types';

export function SuggestionCard({ 
  suggestion, 
  onAccept, 
  onReject, 
  onModify 
}: SuggestionCardProps) {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-50 text-red-700 border-red-200';
      case 'medium': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'low': return 'bg-blue-50 text-blue-700 border-blue-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'addition':
        return (
          <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        );
      case 'modification':
        return (
          <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        );
      case 'removal':
        return (
          <svg className="w-4 h-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-4 hover:border-gray-300 transition-colors">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
            {getTypeIcon(suggestion.type)}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-medium text-gray-900 text-sm capitalize">
                {suggestion.type} Suggestion
              </h4>
              <span className={`px-2 py-1 text-xs rounded-full border ${getPriorityColor(suggestion.priority)}`}>
                {suggestion.priority}
              </span>
            </div>
            <p className="text-xs text-gray-600">{suggestion.category} category</p>
          </div>
        </div>
        
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
          {Math.round(suggestion.confidence * 100)}%
        </div>
      </div>

      {/* Current Rule (if modification) */}
      {suggestion.currentRule && (
        <div className="bg-gray-50 rounded-lg p-3">
          <h5 className="text-xs font-medium text-gray-700 mb-2">Current Rule:</h5>
          <p className="text-sm text-gray-600 leading-relaxed font-mono">
            {suggestion.currentRule}
          </p>
        </div>
      )}

      {/* Suggested Rule */}
      <div className="bg-blue-50 rounded-lg p-3">
        <h5 className="text-xs font-medium text-blue-700 mb-2">Suggested Rule:</h5>
        <p className="text-sm text-blue-700 leading-relaxed font-mono">
          {suggestion.suggestedRule}
        </p>
      </div>

      {/* Reasoning */}
      <div className="bg-amber-50 rounded-lg p-3">
        <h5 className="text-xs font-medium text-amber-700 mb-2">AI Reasoning:</h5>
        <p className="text-xs text-amber-700 leading-relaxed">
          {suggestion.reasoning}
        </p>
      </div>

      {/* Based on Edits */}
      {suggestion.basedOnEdits.length > 0 && (
        <div>
          <h5 className="text-xs font-medium text-gray-700 mb-2">
            Based on {suggestion.basedOnEdits.length} recent edit{suggestion.basedOnEdits.length !== 1 ? 's' : ''}
          </h5>
          <div className="flex flex-wrap gap-1">
            {suggestion.basedOnEdits.slice(0, 3).map((editId, index) => (
              <span key={editId} className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                Edit {index + 1}
              </span>
            ))}
            {suggestion.basedOnEdits.length > 3 && (
              <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                +{suggestion.basedOnEdits.length - 3} more
              </span>
            )}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 pt-2 border-t border-gray-200">
        <button
          onClick={onAccept}
          className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-medium px-3 py-2 rounded-lg transition-colors"
        >
          Accept
        </button>
        <button
          onClick={() => onModify(suggestion.suggestedRule)}
          className="flex-1 bg-blue-500 hover:bg-blue-600 text-white text-xs font-medium px-3 py-2 rounded-lg transition-colors"
        >
          Modify
        </button>
        <button
          onClick={onReject}
          className="px-3 py-2 text-xs font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
        >
          Reject
        </button>
      </div>
    </div>
  );
} 