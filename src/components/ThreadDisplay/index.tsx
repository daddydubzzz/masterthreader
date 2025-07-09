'use client';

import { ThreadDisplayProps } from './types';
import { useThreadDisplay } from './hooks/useThreadDisplay';
import { ThreadCard } from './components/ThreadCard';
import { RecursionButton } from './components/RecursionButton';

export function ThreadDisplay({ 
  threads, 
  onThreadsUpdated, 
  onRecursionRequested,
  scriptTitle
}: ThreadDisplayProps) {
  const {
    hasEditsOrAnnotations,
    updateThread
  } = useThreadDisplay(threads, onThreadsUpdated, scriptTitle);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Thread Grid */}
      <div className="space-y-8 mb-16">
        {threads.map((thread, index) => (
          <div key={thread.id} className="animate-slide-up" style={{ animationDelay: `${index * 150}ms` }}>
            <ThreadCard
              thread={thread}
              threadIndex={index}
              onThreadUpdated={(updatedThread) => updateThread(index, updatedThread)}
            />
          </div>
        ))}
      </div>

      {/* Action Section */}
      <div className="text-center space-y-8">
        {/* Recursion Action */}
        <div className="animate-fade-in">
          <RecursionButton
            visible={hasEditsOrAnnotations}
            onClick={onRecursionRequested}
          />
        </div>

        {/* Instructions */}
        {!hasEditsOrAnnotations && (
          <div className="max-w-4xl mx-auto animate-slide-up">
            <div className="card-premium rounded-3xl p-8 lg:p-12">
              <div className="text-center space-y-6">
                <div className="w-16 h-16 mx-auto bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl">
                  <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-2xl font-bold gradient-text">Ready for refinement</h3>
                  <p className="text-gray-600 text-lg leading-relaxed max-w-2xl mx-auto">
                    Your threads are ready to use, but you can make them even better by editing and adding feedback.
                  </p>
                </div>

                <div className="grid md:grid-cols-3 gap-6 pt-6">
                  {[
                    {
                      icon: (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      ),
                      title: "Edit tweets",
                      description: "Click on any tweet text to make direct edits",
                      color: "blue"
                    },
                    {
                      icon: (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                      ),
                      title: "Add comments",
                      description: "Use comment button to provide detailed feedback",
                      color: "emerald"
                    },
                    {
                      icon: (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                      ),
                      title: "Run recursion",
                      description: "After changes, AI learns and improves the threads",
                      color: "purple"
                    }
                  ].map((item, index) => (
                    <div key={index} className="text-center space-y-3">
                      <div className={`w-12 h-12 mx-auto bg-gradient-to-br ${
                        item.color === 'blue' ? 'from-blue-500 to-blue-600' :
                        item.color === 'emerald' ? 'from-emerald-500 to-emerald-600' :
                        'from-purple-500 to-purple-600'
                      } rounded-xl flex items-center justify-center text-white shadow-lg`}>
                        {item.icon}
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-semibold text-gray-900">{item.title}</h4>
                        <p className="text-sm text-gray-600 leading-relaxed">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 