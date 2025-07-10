'use client';

import { ThreadDisplayProps } from './types';
import { useThreadDisplay } from './hooks/useThreadDisplay';
import { ThreadCard } from './components/ThreadCard';
import { RecursionButton } from './components/RecursionButton';
import { Thread } from '@/types';
import { showNotification } from '@/utils/notifications';

export function ThreadDisplay({ 
  threads, 
  onThreadsUpdated, 
  onRecursionRequested,
  onRegenerateThreads,
  scriptTitle
}: ThreadDisplayProps) {
  const {
    hasEditsOrAnnotations,
    updateThread
  } = useThreadDisplay(threads, onThreadsUpdated, scriptTitle);

  // Export threads to a text file in the specified format
  const exportThreads = (threadsToExport: Thread[]) => {
    const formattedThreads = threadsToExport.map((thread, index) => {
      return `/// THREAD ${index + 1}: \n${thread.content}`;
    }).join('\n\n');

    // Create a blob with the formatted content
    const blob = new Blob([formattedThreads], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    // Create a temporary download link
    const link = document.createElement('a');
    link.href = url;
    link.download = `threads-${new Date().toISOString().split('T')[0]}.txt`;
    
    // Trigger the download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up the URL object
    URL.revokeObjectURL(url);
    
    // Show success message
    showNotification(`${threadsToExport.length} threads exported successfully!`, 'success');
  };

  // Generate more thread variations
  const generateMoreThreads = async () => {
    if (onRegenerateThreads) {
      await onRegenerateThreads();
    } else {
      // Fallback: refresh to the input state
      window.location.reload();
    }
  };

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
        {/* Export and Action Buttons */}
        <div className="animate-fade-in">
          <div className="flex flex-col items-center space-y-6">
            {/* Primary Export Button */}
            <button
              onClick={() => exportThreads(threads)}
              className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export Threads
            </button>

            {/* Secondary Actions */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => {
                  // Clear threads to go back to input state
                  onThreadsUpdated([]);
                }}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-colors duration-200"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                New Script
              </button>
              
              <button
                onClick={generateMoreThreads}
                className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 font-medium rounded-xl transition-colors duration-200"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Generate More
              </button>
            </div>

            {/* Improve Current Threads - Only show if there are edits */}
            {hasEditsOrAnnotations && (
              <div className="pt-6 border-t border-gray-100">
                <div className="text-center space-y-3">
                  <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <span>You&apos;ve made edits — improve these threads now</span>
                  </div>
                  <RecursionButton
                    visible={hasEditsOrAnnotations}
                    onClick={onRecursionRequested}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 