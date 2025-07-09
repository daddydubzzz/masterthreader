'use client';

import { LandingInterfaceProps } from './types';
import { useLandingInterface } from './hooks/useLandingInterface';
import { ScriptInput } from './components/ScriptInput';
import { GenerateButton } from './components/GenerateButton';

export function LandingInterface({ onThreadsGenerated }: LandingInterfaceProps) {
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
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-gray-900">
          MasterThreader
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Transform your scripts into viral Twitter threads.
          Paste your content and let AI create 3 optimized thread variations.
        </p>
      </div>

      {/* Main Interface */}
      <div className="bg-white rounded-xl shadow-lg p-8 space-y-6">
        {/* Script Input */}
        <ScriptInput
          value={script}
          onChange={setScript}
          disabled={isGenerating}
        />

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Error
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  {error}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Generate Button */}
        <GenerateButton
          onClick={handleGenerate}
          isLoading={isGenerating}
          disabled={!script.trim()}
        />
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">
          How it works:
        </h3>
        <ol className="list-decimal list-inside space-y-2 text-blue-800">
          <li>Paste your script or content in the text area above</li>
          <li>Click &ldquo;Generate Threads&rdquo; to create 3 thread variations using Josh&apos;s mega prompt</li>
          <li>Edit and annotate the generated threads inline to improve them</li>
          <li>Use recursion to train the AI based on your edits and feedback</li>
          <li>Export your final threads for Twitter or continue refining</li>
        </ol>
      </div>
    </div>
  );
} 