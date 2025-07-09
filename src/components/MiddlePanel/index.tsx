'use client';

import { MiddlePanelProps } from './types';
import { useMiddlePanel } from './hooks/useMiddlePanel';
import { ScriptInput } from '@/components/LandingInterface/components/ScriptInput';
import { GenerateButton } from '@/components/LandingInterface/components/GenerateButton';

export function MiddlePanel({ 
  selectedMegaPrompt,
  onThreadsGenerated
}: MiddlePanelProps) {
  const {
    script,
    setScript,
    isGenerating,
    error,
    generationHistory,
    generateThreads,
    clearError,
    clearScript
  } = useMiddlePanel(selectedMegaPrompt, onThreadsGenerated);

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Script Workspace</h2>
              <p className="text-sm text-gray-600">
                Transform your content into viral Twitter threads
                {selectedMegaPrompt && (
                  <span className="ml-2 px-2 py-1 text-xs bg-blue-50 text-blue-700 border border-blue-200 rounded-full">
                    Using: {selectedMegaPrompt}
                  </span>
                )}
              </p>
            </div>
          </div>
          
          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            {script && (
              <button
                onClick={clearScript}
                className="btn btn-ghost text-xs px-3 py-2"
                disabled={isGenerating}
              >
                Clear
              </button>
            )}
            {generationHistory.length > 0 && (
              <div className="text-xs text-gray-500">
                {generationHistory.length} generation{generationHistory.length !== 1 ? 's' : ''}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 bg-gray-50/30 overflow-y-auto">
        <div className="max-w-full mx-auto">
          {/* Main Interface Card */}
          <div className="card-premium rounded-3xl p-8 shadow-xl">
            <div className="space-y-8">
              {/* Script Input */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 bg-gradient-to-br from-gray-600 to-gray-700 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">Paste Your Script</h3>
                </div>
                
                <ScriptInput
                  value={script}
                  onChange={setScript}
                  disabled={isGenerating}
                />
              </div>

              {/* Error Display */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-6 animate-slide-up">
                  <div className="flex items-start gap-4">
                    <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-4 h-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-red-800 mb-2">
                        Generation Failed
                      </h4>
                      <p className="text-sm text-red-700 leading-relaxed">
                        {error}
                      </p>
                    </div>
                    <button
                      onClick={clearError}
                      className="text-red-400 hover:text-red-600"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}

              {/* Generate Button */}
              <div className="flex justify-center pt-4">
                <GenerateButton
                  onClick={generateThreads}
                  isLoading={isGenerating}
                  disabled={!script.trim()}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 