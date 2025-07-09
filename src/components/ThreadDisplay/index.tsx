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
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Generated Threads
        </h2>
        <p className="text-gray-600">
          Click on any tweet to edit it, or add comments to provide feedback.
          {hasEditsOrAnnotations && " Once you've made changes, run recursion to improve the threads."}
        </p>
      </div>

      {/* Thread Cards */}
      <div className="space-y-6">
        {threads.map((thread, index) => (
          <ThreadCard
            key={thread.id}
            thread={thread}
            threadIndex={index}
            onThreadUpdated={(updatedThread) => updateThread(index, updatedThread)}
          />
        ))}
      </div>

      {/* Recursion Button */}
      <RecursionButton
        visible={hasEditsOrAnnotations}
        onClick={onRecursionRequested}
      />

      {/* Instructions */}
      {!hasEditsOrAnnotations && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
          <h3 className="font-medium text-blue-900 mb-2">Next Steps</h3>
          <div className="text-sm text-blue-800 space-y-1">
            <p>• <strong>Edit tweets:</strong> Click on any tweet text to make changes</p>
            <p>• <strong>Add comments:</strong> Use the &ldquo;Comment&rdquo; button to provide feedback</p>
            <p>• <strong>Run recursion:</strong> After making changes, the system will learn and improve</p>
          </div>
        </div>
      )}
    </div>
  );
} 