'use client';

import { MiddlePanelProps } from './types';
import { ScriptInput } from '@/components/LandingInterface/components/ScriptInput';
import { GenerateButton } from '@/components/LandingInterface/components/GenerateButton';
import { useLandingInterface } from '@/components/LandingInterface/hooks/useLandingInterface';

export function MiddlePanel({ onThreadsGenerated }: MiddlePanelProps) {
  const {
    script,
    setScript,
    isGenerating,
    error,
    generateThreads
  } = useLandingInterface();

  const handleGenerate = async () => {
    const result = await generateThreads();
    if (result) {
      onThreadsGenerated(result.threads, result.megaPrompt, script);
    }
  };

  return (
    <div className="h-full bg-white flex flex-col">
      {/* Header */}
      <div className="sticky top-0 bg-white/80 backdrop-blur-sm border-b border-gray-200 p-4 z-10">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-gray-900">Generate</h2>
        </div>
        <p className="text-sm text-gray-600">Transform your content into engaging threads</p>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4 overflow-y-auto">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Script Input */}
          <div className="space-y-4">
            <ScriptInput
              value={script}
              onChange={setScript}
              disabled={isGenerating}
              placeholder="Paste your script, blog post, or any content here to transform into engaging Twitter threads..."
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
                  <h3 className="text-sm font-semibold text-red-800 mb-2">
                    Generation Failed
                  </h3>
                  <p className="text-sm text-red-700 leading-relaxed">
                    {error}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Generate Button */}
          <div className="flex justify-center pt-4">
            <GenerateButton
              onClick={handleGenerate}
              isLoading={isGenerating}
              disabled={!script.trim()}
            />
          </div>
        </div>
      </div>
    </div>
  );
} 