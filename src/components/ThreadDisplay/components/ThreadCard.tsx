'use client';

import { useState } from 'react';
import { ThreadCardProps } from '../types';
import { Tweet } from './Tweet';
import { Edit, Annotation } from '@/types';

export function ThreadCard({ thread, threadIndex, onThreadUpdated }: ThreadCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [editingTweetIndex, setEditingTweetIndex] = useState<number | null>(null);

  // Parse thread content into individual tweets, handling em-dash separators
  const tweets = thread.content
    .split(/\n\n—\n\n|\n—\n|—/)
    .map(tweet => tweet.trim())
    .filter(tweet => tweet.length > 0);
  
  // Get the approach/style from thread ID for display
  const threadStyle = thread.id.includes('story') ? 'Story-Driven' : 
                     thread.id.includes('data') ? 'Data-Driven' : 
                     thread.id.includes('actionable') ? 'Actionable' : 
                     `Thread ${threadIndex + 1}`;

  const handleTweetEdit = (tweetIndex: number, newContent: string) => {
    const originalContent = tweets[tweetIndex];
    
    if (originalContent === newContent) {
      setEditingTweetIndex(null);
      return;
    }

    const updatedTweets = [...tweets];
    updatedTweets[tweetIndex] = newContent;
    
    // Rejoin with proper em-dash separators
    const updatedContent = updatedTweets.join('\n\n—\n\n');
    
    // Create proper Edit object with timestamp
    const newEdit: Edit = {
      id: `edit-${Date.now()}-${Math.random()}`,
      originalText: originalContent,
      editedText: newContent,
      timestamp: new Date()
    };
    
    const updatedThread = {
      ...thread,
      content: updatedContent,
      edits: [...thread.edits, newEdit]
    };
    
    onThreadUpdated(updatedThread);
    setEditingTweetIndex(null);
  };

  const handleAnnotationAdd = (annotation: string, type: Annotation['type']) => {
    const newAnnotation: Annotation = {
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

  // Clean, minimal styling for all thread types
  const getThreadStyleConfig = () => {
    return {
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    };
  };

  const styleConfig = getThreadStyleConfig();

  return (
    <article className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:border-gray-300 transition-all duration-200 group">
      {/* Thread Header */}
      <header className="bg-gray-50 border-b border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-4 text-gray-800 hover:text-gray-900 transition-colors group/button"
          >
            <div className="relative">
              <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center text-gray-600 group-hover/button:bg-gray-200 transition-colors duration-200">
                {styleConfig.icon}
              </div>
            </div>
            
            <div className="text-left">
              <h2 className="text-2xl font-bold gradient-text tracking-tight">{threadStyle}</h2>
              <div className="flex items-center gap-2 mt-1">
                <div className={`w-6 h-6 rounded-lg bg-white/80 flex items-center justify-center transform transition-transform duration-300 ${isExpanded ? 'rotate-90' : ''}`}>
                  <svg className="w-3 h-3 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
                <span className="text-sm font-medium text-gray-600">
                  {tweets.length} tweet{tweets.length !== 1 ? 's' : ''}
                </span>
                {hasChanges && (
                  <span className="text-xs font-medium text-gray-500">• Modified</span>
                )}
              </div>
            </div>
          </button>
          
          {/* Status Badges */}
          {hasChanges && (
            <div className="flex items-center gap-3">
              {editCount > 0 && (
                <div className="flex items-center gap-2 px-4 py-2 bg-blue-100/80 border border-blue-200 rounded-full">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  <span className="text-sm font-medium text-blue-700">
                    {editCount} edit{editCount !== 1 ? 's' : ''}
                  </span>
                </div>
              )}
              {annotationCount > 0 && (
                <div className="flex items-center gap-2 px-4 py-2 bg-blue-100/80 border border-blue-200 rounded-full">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  <span className="text-sm font-medium text-blue-700">
                    {annotationCount} comment{annotationCount !== 1 ? 's' : ''}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Thread Content */}
      {isExpanded && (
        <div className="p-6 lg:p-8">
          <div className="space-y-6">
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
        </div>
      )}
    </article>
  );
} 