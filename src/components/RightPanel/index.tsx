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
    startTrainingSession,
    endTrainingSession
  } = useRightPanel(threads, originalScript);

  const hasThreadData = threads && threads.length > 0;
  const hasEditsOrAnnotations = hasThreadData && threads.some(thread => 
    thread.edits.length > 0 || thread.annotations.length > 0
  );

  return (
    <div className="h-full bg-purple-50 flex flex-col">
      {/* Main Content */}
      <div className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-6">
          {/* Thread Analysis Status */}
          {hasThreadData && (
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Thread Analysis</h3>
              <div className="space-y-2 text-xs text-gray-600">
                <p>• {threads.length} threads analyzed</p>
                <p>• {editCaptures.length} edits captured</p>
                <p>• {learningPatterns.length} patterns identified</p>
                <p>• {suggestions.length} suggestions generated</p>
              </div>
              
              {/* Training Session Controls */}
              <div className="mt-4 flex items-center gap-2">
                {!currentSession ? (
                  <button
                    onClick={startTrainingSession}
                    disabled={!hasEditsOrAnnotations}
                    className={`text-xs px-4 py-2 rounded-lg font-medium transition-colors ${
                      hasEditsOrAnnotations 
                        ? 'bg-purple-600 hover:bg-purple-700 text-white' 
                        : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    Start Training Session
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2 text-xs text-purple-600">
                      <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                      Training Active
                    </div>
                    <button
                      onClick={endTrainingSession}
                      className="text-xs px-3 py-1 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors"
                    >
                      End Session
                    </button>
                  </div>
                )}
                
                {isProcessing && (
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <div className="w-3 h-3 border border-gray-300 border-t-purple-500 rounded-full animate-spin"></div>
                    Processing...
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Learning Patterns */}
          {learningPatterns.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-900">Learning Patterns</h3>
              {learningPatterns.map((pattern) => (
                <div key={pattern.id} className="bg-white border border-gray-200 rounded-xl p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-emerald-100 rounded-lg flex items-center justify-center">
                        <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 text-sm capitalize">{pattern.patternType}</h4>
                        <p className="text-xs text-gray-600">Confidence: {Math.round(pattern.confidence * 100)}%</p>
                      </div>
                    </div>
                    <span className="text-xs text-gray-500">
                      {pattern.frequency}x frequency
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-700 mb-3">{pattern.description}</p>
                  
                  {pattern.examples.length > 0 && (
                    <div className="space-y-2">
                      <h5 className="text-xs font-medium text-gray-600">Examples:</h5>
                      {pattern.examples.slice(0, 2).map((example, index) => (
                        <div key={index} className="text-xs text-gray-600 bg-gray-50 p-2 rounded font-mono">
                          {example}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
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

          {/* Edit Captures */}
          {editCaptures.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-900">Recent Edits</h3>
              <div className="max-h-64 overflow-y-auto space-y-2">
                {editCaptures.slice(0, 10).map((capture) => (
                  <div key={capture.id} className="bg-white border border-gray-200 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-gray-600 capitalize">
                        {capture.editType}
                      </span>
                      <span className="text-xs text-gray-500">
                        {capture.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="text-xs text-gray-600">{capture.context}</div>
                    {capture.originalText && (
                      <div className="mt-2 space-y-1">
                        <div className="text-xs text-red-600 bg-red-50 p-2 rounded">
                          Original: {capture.originalText}
                        </div>
                        <div className="text-xs text-green-600 bg-green-50 p-2 rounded">
                          Edited: {capture.editedText}
                        </div>
                      </div>
                    )}
                    {capture.userComment && (
                      <div className="mt-2 text-xs text-blue-600 bg-blue-50 p-2 rounded">
                        Comment: {capture.userComment}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {(!hasThreadData || (!hasEditsOrAnnotations && editCaptures.length === 0)) && (
            <div className="bg-white rounded-xl p-8 border border-gray-200 shadow-sm text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Ready to Learn</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                {hasThreadData 
                  ? "Start editing threads and adding feedback to capture your preferences and train the AI."
                  : "Generate threads to start capturing your editing patterns and improve the AI's understanding of your style."
                }
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 