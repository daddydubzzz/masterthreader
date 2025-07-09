'use client';

import { useState } from 'react';
import { RightPanelProps, TrainingSession } from './types';
import { useRightPanel } from './hooks/useRightPanel';
import { SuggestionCard } from './components/SuggestionCard';

export function RightPanel({ 
  generatedThreads,
  originalScript,
  selectedMegaPrompt,
  onMegaPromptSuggestion
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
  } = useRightPanel(generatedThreads, originalScript, selectedMegaPrompt, onMegaPromptSuggestion);

  const [activeTab, setActiveTab] = useState<'suggestions' | 'patterns' | 'edits' | 'session'>('suggestions');

  const handleModifySuggestion = (modifiedRule: string) => {
    // For now, just call the suggestion callback with the modified rule
    onMegaPromptSuggestion(modifiedRule);
  };

  const formatSessionDuration = (session: TrainingSession | null) => {
    if (!session?.startTime) return '0m';
    const endTime = session.endTime || new Date();
    const duration = Math.floor((endTime.getTime() - session.startTime.getTime()) / (1000 * 60));
    return `${duration}m`;
  };

  return (
    <div className="h-full bg-white border-l border-gray-200 flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">AI Learning</h2>
            <p className="text-sm text-gray-600">Training & prompt optimization</p>
          </div>
        </div>

        {/* Session Status */}
        {currentSession && (
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-purple-700">Training Session Active</span>
              </div>
              <button
                onClick={endTrainingSession}
                className="text-xs text-purple-600 hover:text-purple-800"
              >
                End Session
              </button>
            </div>
            <div className="grid grid-cols-3 gap-3 text-xs">
              <div className="text-center">
                <div className="font-semibold text-purple-700">{currentSession.editsCount}</div>
                <div className="text-purple-600">Edits</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-purple-700">{currentSession.patternsIdentified}</div>
                <div className="text-purple-600">Patterns</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-purple-700">{formatSessionDuration(currentSession)}</div>
                <div className="text-purple-600">Duration</div>
              </div>
            </div>
          </div>
        )}

        {/* No Session State */}
        {!currentSession && !generatedThreads?.length && (
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-center">
            <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <p className="text-sm text-gray-600 mb-3">Generate threads to start AI learning</p>
            <button
              onClick={startTrainingSession}
              className="text-xs bg-purple-500 hover:bg-purple-600 text-white px-3 py-2 rounded-lg transition-colors"
            >
              Start Manual Session
            </button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 bg-gray-50">
        <div className="flex text-xs">
          {[
            { id: 'suggestions' as const, label: 'Suggestions', count: suggestions.length },
            { id: 'patterns' as const, label: 'Patterns', count: learningPatterns.length },
            { id: 'edits' as const, label: 'Edits', count: editCaptures.length }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 px-4 py-3 font-medium transition-colors ${
                activeTab === tab.id
                  ? 'text-purple-600 border-b-2 border-purple-500 bg-white'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
              }`}
            >
              {tab.label} {tab.count > 0 && (
                <span className="ml-1 px-1.5 py-0.5 bg-gray-200 text-gray-600 rounded-full text-xs">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Suggestions Tab */}
        {activeTab === 'suggestions' && (
          <div className="p-4 space-y-4">
            {isProcessing && (
              <div className="flex items-center gap-3 p-4 bg-purple-50 border border-purple-200 rounded-xl">
                <div className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-sm text-purple-700">Analyzing patterns and generating suggestions...</span>
              </div>
            )}
            
            {suggestions.length === 0 && !isProcessing ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">No Suggestions Yet</h3>
                <p className="text-xs text-gray-600">Edit threads to generate AI suggestions</p>
              </div>
            ) : (
              suggestions.map((suggestion) => (
                <SuggestionCard
                  key={suggestion.id}
                  suggestion={suggestion}
                  onAccept={() => acceptSuggestion(suggestion.id)}
                  onReject={() => rejectSuggestion(suggestion.id)}
                  onModify={handleModifySuggestion}
                />
              ))
            )}
          </div>
        )}

        {/* Patterns Tab */}
        {activeTab === 'patterns' && (
          <div className="p-4 space-y-3">
            {learningPatterns.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">No Patterns Identified</h3>
                <p className="text-xs text-gray-600">AI will identify patterns as you edit threads</p>
              </div>
            ) : (
              learningPatterns.map((pattern) => (
                <div key={pattern.id} className="bg-white border border-gray-200 rounded-lg p-3">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="text-sm font-medium text-gray-900 capitalize">{pattern.patternType}</h4>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span>×{pattern.frequency}</span>
                      <span>{Math.round(pattern.confidence * 100)}%</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 mb-3">{pattern.description}</p>
                  {pattern.examples.length > 0 && (
                    <div className="bg-gray-50 rounded-lg p-2">
                      <p className="text-xs font-mono text-gray-700">{pattern.examples[0]}</p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* Edits Tab */}
        {activeTab === 'edits' && (
          <div className="p-4 space-y-3">
            {editCaptures.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">No Edits Captured</h3>
                <p className="text-xs text-gray-600">Thread edits will appear here for analysis</p>
              </div>
            ) : (
              editCaptures.map((edit) => (
                <div key={edit.id} className="bg-white border border-gray-200 rounded-lg p-3">
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-xs font-medium text-gray-900 capitalize">{edit.editType} Edit</span>
                    <span className="text-xs text-gray-500">
                      {edit.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="bg-red-50 border border-red-200 rounded p-2">
                      <span className="text-red-700 font-mono">{edit.originalText}</span>
                    </div>
                    <div className="bg-emerald-50 border border-emerald-200 rounded p-2">
                      <span className="text-emerald-700 font-mono">{edit.editedText}</span>
                    </div>
                  </div>
                  {edit.userComment && (
                    <div className="mt-2 bg-blue-50 border border-blue-200 rounded p-2">
                      <span className="text-xs text-blue-700">{edit.userComment}</span>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
} 