'use client';

import { useState } from 'react';
import { ThreadCardProps } from '../types';
import { Tweet } from './Tweet';

export function ThreadCard({ thread, threadIndex, onThreadUpdated }: ThreadCardProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [editingTweetIndex, setEditingTweetIndex] = useState<number | null>(null);

  // Parse thread content into individual tweets
  const tweets = thread.content.split('\n').filter(tweet => tweet.trim());
  
  // Get the approach/style from thread ID for display
  const threadStyle = thread.id.includes('story') ? 'Story-Driven' : 
                     thread.id.includes('data') ? 'Data-Driven' : 
                     thread.id.includes('actionable') ? 'Actionable' : 
                     `Thread ${threadIndex + 1}`;

  const handleTweetEdit = (tweetIndex: number, newContent: string) => {
    const updatedTweets = [...tweets];
    updatedTweets[tweetIndex] = newContent;
    
    const updatedThread = {
      ...thread,
      content: updatedTweets.join('\n')
    };
    
    onThreadUpdated(updatedThread);
    setEditingTweetIndex(null);
  };

  const handleAnnotationAdd = (annotation: string, type: 'improvement' | 'clarification' | 'style') => {
    const newAnnotation = {
      id: `annotation-${Date.now()}-${Math.random()}`,
      text: annotation,
      type,
      timestamp: new Date()
    };

    const updatedThread = {
      ...thread,
      annotations: [...thread.annotations, newAnnotation]
    };
    
    onThreadUpdated(updatedThread);
  };

  const editCount = thread.edits.length;
  const annotationCount = thread.annotations.length;
  const hasChanges = editCount > 0 || annotationCount > 0;

  return (
    <div className="bg-white border border-gray-300 rounded-lg shadow-sm">
      {/* Thread Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center space-x-2 text-gray-700 hover:text-gray-900"
          >
            <span className={`transform transition-transform ${isExpanded ? 'rotate-90' : ''}`}>
              ▶
            </span>
            <h3 className="font-semibold text-lg">{threadStyle}</h3>
          </button>
          
          {hasChanges && (
            <div className="flex items-center space-x-2">
              {editCount > 0 && (
                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                  {editCount} edit{editCount !== 1 ? 's' : ''}
                </span>
              )}
              {annotationCount > 0 && (
                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
                  {annotationCount} comment{annotationCount !== 1 ? 's' : ''}
                </span>
              )}
            </div>
          )}
        </div>

        <div className="text-sm text-gray-500">
          {tweets.length} tweet{tweets.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Thread Content */}
      {isExpanded && (
        <div className="p-4 space-y-4">
          {tweets.map((tweetContent, tweetIndex) => (
            <Tweet
              key={`${thread.id}-tweet-${tweetIndex}`}
              content={tweetContent}
              tweetIndex={tweetIndex}
              threadIndex={threadIndex}
              onTweetEdited={(newContent) => handleTweetEdit(tweetIndex, newContent)}
              onAnnotationAdded={handleAnnotationAdd}
              annotations={thread.annotations}
              isEditing={editingTweetIndex === tweetIndex}
              onStartEdit={() => setEditingTweetIndex(tweetIndex)}
              onEndEdit={() => setEditingTweetIndex(null)}
            />
          ))}
        </div>
      )}
    </div>
  );
} 