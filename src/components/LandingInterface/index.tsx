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
    <div className="min-h-screen flex items-center justify-center px-4 py-16">
      <div className="max-w-4xl w-full mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-16 animate-slide-up">
          <div className="mb-8">
            <div className="inline-flex items-center gap-3 mb-6">
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-700 rounded-2xl flex items-center justify-center shadow-2xl">
                  <span className="text-white font-bold text-xl tracking-tight">MT</span>
                </div>
                <div className="absolute -inset-2 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl opacity-20 blur-xl"></div>
              </div>
              <div className="text-left">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold gradient-text tracking-tight text-balance">
                  MasterThreader
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                  <span className="text-sm font-medium text-gray-500">AI Copy Refinement Engine</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="space-y-6 max-w-3xl mx-auto">
            <p className="text-xl md:text-2xl text-gray-700 leading-relaxed text-balance">
                             Transform your scripts into viral Twitter threads with Josh&apos;s
              <span className="font-semibold text-gray-900"> AI-powered generation</span> and 
              <span className="font-semibold text-gray-900"> intelligent refinement system</span>.
            </p>
            
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-full border border-blue-100">
                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                <span className="font-medium text-blue-700">3 Thread Variations</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 rounded-full border border-emerald-100">
                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                <span className="font-medium text-emerald-700">Inline Editing</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-purple-50 rounded-full border border-purple-100">
                <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                <span className="font-medium text-purple-700">AI Learning</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Interface Card */}
        <div className="card-premium rounded-3xl p-8 lg:p-12 shadow-2xl animate-scale-in">
          <div className="space-y-8">
            {/* Script Input */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-gradient-to-br from-gray-600 to-gray-700 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Paste Your Script</h2>
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

        {/* How it Works */}
        <div className="mt-16 animate-fade-in">
          <div className="text-center mb-12">
            <h3 className="text-2xl font-bold gradient-text mb-4">
              How it works
            </h3>
            <p className="text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Experience the future of AI-powered content creation with our intelligent workflow
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                step: "01",
                title: "Input Script",
                description: "Paste your content and let Josh's mega prompt analyze it for optimal thread generation",
                icon: (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                ),
                color: "blue"
              },
              {
                step: "02",
                title: "Edit & Refine",
                description: "Make inline edits and add comments to train the AI with your unique voice and preferences",
                icon: (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                ),
                color: "emerald"
              },
              {
                step: "03",
                title: "Export Threads",
                description: "Use recursion to improve quality, then export your polished threads ready for Twitter",
                icon: (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                ),
                color: "purple"
              }
            ].map((item, index) => (
              <div key={index} className="text-center group">
                <div className="relative mb-6">
                  <div className={`w-16 h-16 mx-auto bg-gradient-to-br ${
                    item.color === 'blue' ? 'from-blue-500 to-blue-600' :
                    item.color === 'emerald' ? 'from-emerald-500 to-emerald-600' :
                    'from-purple-500 to-purple-600'
                  } rounded-2xl flex items-center justify-center text-white shadow-xl group-hover:scale-110 transition-transform duration-300`}>
                    {item.icon}
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center">
                    <span className="text-xs font-bold text-gray-700">{item.step}</span>
                  </div>
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-3">{item.title}</h4>
                <p className="text-gray-600 leading-relaxed text-sm">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 