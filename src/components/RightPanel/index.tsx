'use client';

import { RightPanelProps } from './types';
import { useRightPanel } from './hooks/useRightPanel';
import { SuggestionCard } from './components/SuggestionCard';

export function RightPanel({ 
  threads,
  originalScript
}: RightPanelProps) {
  const {
    editCaptures,
    learningPatterns,
    suggestions,
    currentSession,
    isProcessing,
    acceptSuggestion,
    rejectSuggestion,
    startTrainingSession
  } = useRightPanel(threads, originalScript);

  return (
    <div className="h-full bg-purple-50 flex flex-col">
      {/* Header */}
      <div className="sticky top-0 bg-white/80 backdrop-blur-sm border-b border-gray-200 p-4 z-10">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-purple-700 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-gray-900">Learn & Refine</h2>
        </div>
        <p className="text-sm text-gray-600">AI training and megaprompt suggestions</p>
        
        {/* Status indicators */}
        <div className="mt-3 flex items-center gap-2">
          {currentSession && (
            <div className="text-xs text-purple-600 bg-purple-50 px-2 py-1 rounded-full border border-purple-200">
              Training Active
            </div>
          )}
          {isProcessing && (
            <div className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full border border-blue-200">
              Processing...
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-6">
          {/* Thread Analysis Status */}
          {threads && threads.length > 0 && (
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Thread Analysis</h3>
              <div className="space-y-2 text-xs text-gray-600">
                <p>• {threads.length} threads ready for analysis</p>
                <p>• {editCaptures.length} edits captured</p>
                <p>• {learningPatterns.length} patterns identified</p>
              </div>
              
              {!currentSession && (
                <button
                  onClick={startTrainingSession}
                  className="mt-4 btn btn-primary text-xs px-4 py-2"
                >
                  Start Training Session
                </button>
              )}
            </div>
          )}

          {/* MegaPrompt Suggestions */}
          {suggestions.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-900">MegaPrompt Suggestions</h3>
              {suggestions.map((suggestion) => (
                <SuggestionCard
                  key={suggestion.id}
                  suggestion={suggestion}
                  onAccept={() => acceptSuggestion(suggestion.id)}
                  onReject={() => rejectSuggestion(suggestion.id)}
                  onModify={(modifiedRule) => {
                    console.log('Modified rule:', modifiedRule);
                    // Handle modification
                  }}
                />
              ))}
            </div>
          )}

          {/* Empty State */}
          {(!threads || threads.length === 0) && (
            <div className="bg-white rounded-xl p-8 border border-gray-200 shadow-sm text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Ready to Learn</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Generate threads to start capturing your editing patterns and improve the AI&apos;s understanding of your style.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 