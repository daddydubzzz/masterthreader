'use client';

import { useState, useRef, useEffect } from 'react';
import { TweetProps } from '../types';
import { AnnotationBox } from './AnnotationBox';
import { Annotation } from '@/types';

export function Tweet({
  content,
  tweetIndex,
  onTweetEdited,
  onAnnotationAdded,
  annotations,
  onStartEdit,
  onEndEdit
}: TweetProps) {
  const [editedContent, setEditedContent] = useState(content);
  const [showAnnotationBox, setShowAnnotationBox] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Update editedContent when content prop changes
  useEffect(() => {
    setEditedContent(content);
  }, [content]);

  // Auto-resize textarea to exactly fit content - no scrolling ever
  useEffect(() => {
    const adjustHeight = () => {
      if (textareaRef.current) {
        const textarea = textareaRef.current;
        // Reset height to auto to calculate natural height
        textarea.style.height = 'auto';
        // Calculate the height needed for the content
        const scrollHeight = textarea.scrollHeight;
        // Set height with a minimum of 60px
        textarea.style.height = Math.max(scrollHeight, 60) + 'px';
      }
    };

    // Small delay to ensure DOM is ready
    const timeoutId = setTimeout(adjustHeight, 0);
    return () => clearTimeout(timeoutId);
  }, [editedContent, content]); // Also depend on content to handle initial load

  // Auto-focus when component mounts and handle editing state
  useEffect(() => {
    if (textareaRef.current) {
      const textarea = textareaRef.current;
      
      const handleFocus = () => {
        onStartEdit();
      };
      
      const handleBlur = () => {
        // Small delay to allow for potential re-focus
        setTimeout(() => {
          if (document.activeElement !== textarea) {
            onEndEdit();
          }
        }, 100);
      };
      
      textarea.addEventListener('focus', handleFocus);
      textarea.addEventListener('blur', handleBlur);
      
      return () => {
        textarea.removeEventListener('focus', handleFocus);
        textarea.removeEventListener('blur', handleBlur);
      };
    }
  }, [onStartEdit, onEndEdit]);

  const handleSaveEdit = () => {
    if (editedContent !== content) {
      onTweetEdited(editedContent);
    }
  };

  const handleCancelEdit = () => {
    setEditedContent(content);
    if (textareaRef.current) {
      textareaRef.current.blur();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.metaKey) {
      e.preventDefault();
      handleSaveEdit();
      if (textareaRef.current) {
        textareaRef.current.blur();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancelEdit();
    }
  };

  const handleAnnotationSave = (text: string, type: Annotation['type']) => {
    onAnnotationAdded(text, type);
    setShowAnnotationBox(false);
  };

  // Simple character count calculations
  const characterCount = editedContent.length;
  const isOverLimit = characterCount > 280;
  const isNearLimit = characterCount > 250;

  // Extract tweet number if present
  const tweetNumber = content.match(/^(\d+)\/\d+\s/) ? content.match(/^(\d+)\/\d+\s/)?.[1] : tweetIndex + 1;

  return (
    <div className="group relative border border-gray-100 rounded-xl p-4 hover:border-gray-200 hover:bg-gray-50/50 transition-all duration-200">
      {/* Tweet Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 border border-gray-300 shadow-sm flex items-center justify-center text-gray-700 font-semibold text-sm hover:shadow-md transition-all duration-200">
            {tweetNumber}
          </div>
        </div>
        
        {/* Tweet Actions */}
        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
          <button
            onClick={() => setShowAnnotationBox(true)}
            className="flex items-center gap-1 px-2 py-1 text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
          >
            <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
              <path d="M7 12.25C9.89873 12.25 12.25 9.89873 12.25 7C12.25 4.10127 9.89873 1.75 7 1.75C4.10127 1.75 1.75 4.10127 1.75 7C1.75 8.19469 2.18164 9.29002 2.89062 10.1484L1.75 12.25L7 12.25Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Comment
          </button>
        </div>
      </div>

      {/* Tweet Content - Always Editable */}
      <div className="space-y-4">
        <textarea
          ref={textareaRef}
          value={editedContent}
          onChange={(e) => setEditedContent(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleSaveEdit}
          className="w-full p-3 border border-transparent rounded-lg focus:border-gray-300 focus:bg-white resize-none text-gray-900 placeholder-gray-400 leading-relaxed transition-all duration-200 bg-transparent hover:bg-gray-50/50 focus:outline-none"
          placeholder="Edit your tweet..."
          style={{ 
            overflow: 'hidden',
            minHeight: '60px'
          }}
        />
        
        {/* Character Count - Always visible and stationary */}
        <div className="flex justify-end">
          <span className={`text-xs font-medium ${
            isOverLimit ? 'text-red-600' : isNearLimit ? 'text-orange-600' : 'text-gray-400'
          }`}>
            {characterCount}/280
          </span>
        </div>
      </div>

      {/* Annotations Display */}
      {annotations.length > 0 && (
        <div className="mt-4 space-y-2">
          {annotations.map((annotation) => {
            const getAnnotationIcon = (type: Annotation['type']) => {
              switch (type) {
                case 'improvement': return '💡';
                case 'tone': return '🎭';
                case 'engagement': return '🚀';
                case 'clarification': return '🔍';
                case 'structure': return '🏗️';
                case 'accuracy': return '✅';
                case 'style': return '✨';
                case 'general': return '💬';
                default: return '💡';
              }
            };

            const getAnnotationColor = (type: Annotation['type']) => {
              switch (type) {
                case 'improvement': return 'bg-blue-50 border-blue-200';
                case 'tone': return 'bg-purple-50 border-purple-200';
                case 'engagement': return 'bg-green-50 border-green-200';
                case 'clarification': return 'bg-yellow-50 border-yellow-200';
                case 'structure': return 'bg-indigo-50 border-indigo-200';
                case 'accuracy': return 'bg-red-50 border-red-200';
                case 'style': return 'bg-pink-50 border-pink-200';
                case 'general': return 'bg-gray-50 border-gray-200';
                default: return 'bg-gray-50 border-gray-200';
              }
            };

            return (
              <div
                key={annotation.id}
                className={`${getAnnotationColor(annotation.type)} rounded-lg p-3 border`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{getAnnotationIcon(annotation.type)}</span>
                    <span className="text-xs font-medium text-gray-700 capitalize">
                      {annotation.type}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {annotation.timestamp.toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-sm text-gray-800 leading-relaxed">
                  {annotation.text}
                </p>
              </div>
            );
          })}
        </div>
      )}

      {/* Annotation Box */}
      {showAnnotationBox && (
        <AnnotationBox
          isOpen={showAnnotationBox}
          onClose={() => setShowAnnotationBox(false)}
          onSave={handleAnnotationSave}
          existingAnnotations={annotations}
        />
      )}
    </div>
  );
} 