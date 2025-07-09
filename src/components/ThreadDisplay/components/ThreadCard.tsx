'use client';

import { useState } from 'react';
import { ThreadCardProps } from '../types';
import { Tweet } from './Tweet';

export function ThreadCard({ thread, threadIndex, onThreadUpdated }: ThreadCardProps) {
  const [isExpanded, setIsExpanded] = useState(true);
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
    const updatedTweets = [...tweets];
    updatedTweets[tweetIndex] = newContent;
    
    // Rejoin with proper em-dash separators
    const updatedContent = updatedTweets.join('\n\n—\n\n');
    
    const updatedThread = {
      ...thread,
      content: updatedContent
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

  // Style variants for different thread types
  const getThreadStyleConfig = () => {
    switch (threadStyle) {
      case 'Story-Driven':
        return {
          gradient: 'from-purple-500 to-pink-600',
          bg: 'from-purple-50 to-pink-50',
          border: 'border-purple-200',
          icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          )
        };
      case 'Data-Driven':
        return {
          gradient: 'from-blue-500 to-cyan-600',
          bg: 'from-blue-50 to-cyan-50',
          border: 'border-blue-200',
          icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          )
        };
      case 'Actionable':
        return {
          gradient: 'from-emerald-500 to-teal-600',
          bg: 'from-emerald-50 to-teal-50',
          border: 'border-emerald-200',
          icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          )
        };
      default:
        return {
          gradient: 'from-gray-500 to-gray-600',
          bg: 'from-gray-50 to-gray-100',
          border: 'border-gray-200',
          icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          )
        };
    }
  };

  const styleConfig = getThreadStyleConfig();

  return (
    <article className="card-premium rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 group">
      {/* Thread Header */}
      <header className={`bg-gradient-to-r ${styleConfig.bg} border-b ${styleConfig.border} p-6`}>
        <div className="flex items-center justify-between">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-4 text-gray-800 hover:text-gray-900 transition-colors group/button"
          >
            <div className="relative">
              <div className={`w-12 h-12 bg-gradient-to-br ${styleConfig.gradient} rounded-2xl flex items-center justify-center text-white shadow-lg group-hover/button:scale-110 transition-transform duration-300`}>
                {styleConfig.icon}
              </div>
              <div className="absolute -inset-1 bg-gradient-to-br ${styleConfig.gradient} rounded-2xl opacity-20 blur-sm group-hover/button:opacity-40 transition-opacity duration-300"></div>
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
                <div className="flex items-center gap-2 px-4 py-2 bg-amber-100/80 border border-amber-200 rounded-full">
                  <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                  <span className="text-sm font-medium text-amber-700">
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