'use client';

import { useState, useRef, useEffect } from 'react';
import { TweetProps } from '../types';
import { AnnotationBox } from './AnnotationBox';

export function Tweet({
  content,
  tweetIndex,
  onTweetEdited,
  onAnnotationAdded,
  annotations,
  isEditing,
  onStartEdit,
  onEndEdit
}: TweetProps) {
  const [editedContent, setEditedContent] = useState(content);
  const [showAnnotationBox, setShowAnnotationBox] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [editedContent]);

  // Focus and select text when starting edit
  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  }, [isEditing]);

  const handleSaveEdit = () => {
    onTweetEdited(editedContent);
    onEndEdit();
  };

  const handleCancelEdit = () => {
    setEditedContent(content);
    onEndEdit();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.metaKey) {
      e.preventDefault();
      handleSaveEdit();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancelEdit();
    }
  };

  const handleAnnotationSave = (text: string, type: 'improvement' | 'clarification' | 'style') => {
    onAnnotationAdded(text, type);
    setShowAnnotationBox(false);
  };

  // Extract tweet number if present
  const tweetNumber = content.match(/^(\d+)\/\d+\s/) ? content.match(/^(\d+)\/\d+\s/)?.[1] : tweetIndex + 1;
  const cleanContent = content.replace(/^\d+\/\d+\s/, '');

  return (
    <div className="group relative border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">
      {/* Tweet Number */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-500">
          Tweet {tweetNumber}
        </span>
        
        {/* Tweet Actions */}
        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center space-x-2">
          {!isEditing && (
            <>
              <button
                onClick={onStartEdit}
                className="text-xs text-blue-600 hover:text-blue-800 font-medium"
              >
                Edit
              </button>
              <button
                onClick={() => setShowAnnotationBox(true)}
                className="text-xs text-gray-600 hover:text-gray-800 font-medium"
              >
                Comment
              </button>
            </>
          )}
        </div>
      </div>

      {/* Tweet Content */}
      {isEditing ? (
        <div className="space-y-3">
          <textarea
            ref={textareaRef}
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full p-3 border border-blue-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            placeholder="Edit your tweet..."
            rows={3}
          />
          <div className="flex items-center space-x-2">
            <button
              onClick={handleSaveEdit}
              className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
            >
              Save
            </button>
            <button
              onClick={handleCancelEdit}
              className="px-3 py-1.5 bg-gray-200 text-gray-700 text-sm rounded-md hover:bg-gray-300"
            >
              Cancel
            </button>
            <span className="text-xs text-gray-500">
              ⌘ + Enter to save, Esc to cancel
            </span>
          </div>
        </div>
      ) : (
        <div
          onClick={onStartEdit}
          className="cursor-text p-2 rounded hover:bg-gray-50 transition-colors"
        >
          <p className="text-gray-900 leading-relaxed whitespace-pre-wrap">
            {cleanContent}
          </p>
        </div>
      )}

      {/* Annotations Display */}
      {annotations.length > 0 && (
        <div className="mt-3 space-y-2">
          {annotations.map((annotation) => (
            <div
              key={annotation.id}
              className="bg-yellow-50 border border-yellow-200 rounded-md p-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-yellow-800 uppercase">
                  {annotation.type}
                </span>
                <span className="text-xs text-gray-500">
                  {annotation.timestamp.toLocaleTimeString()}
                </span>
              </div>
              <p className="text-sm text-yellow-900 mt-1">
                {annotation.text}
              </p>
            </div>
          ))}
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