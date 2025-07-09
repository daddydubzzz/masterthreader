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

  // Calculate character count
  const characterCount = editedContent.length;
  const isOverLimit = characterCount > 280;
  const isNearLimit = characterCount > 250;

  // Extract tweet number if present
  const tweetNumber = content.match(/^(\d+)\/\d+\s/) ? content.match(/^(\d+)\/\d+\s/)?.[1] : tweetIndex + 1;
  const cleanContent = content.replace(/^\d+\/\d+\s/, '');

  return (
    <div className="group relative border border-gray-100 rounded-2xl p-5 hover:border-gray-200 hover:bg-gray-50/30 transition-all duration-200">
      {/* Tweet Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-medium text-sm">
            {tweetNumber}
          </div>
          <span className="text-sm font-medium text-gray-600">
            Tweet {tweetNumber}
          </span>
        </div>
        
        {/* Tweet Actions */}
        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2">
          {!isEditing && (
            <>
              <button
                onClick={onStartEdit}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors font-medium"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M8.75 2.75L11.25 5.25L4.375 12.125H1.875V9.625L8.75 2.75Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Edit
              </button>
              <button
                onClick={() => setShowAnnotationBox(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors font-medium"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M7 12.25C9.89873 12.25 12.25 9.89873 12.25 7C12.25 4.10127 9.89873 1.75 7 1.75C4.10127 1.75 1.75 4.10127 1.75 7C1.75 8.19469 2.18164 9.29002 2.89062 10.1484L1.75 12.25L7 12.25Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Comment
              </button>
            </>
          )}
        </div>
      </div>

      {/* Tweet Content */}
      {isEditing ? (
        <div className="space-y-4">
          <div className="relative">
            <textarea
              ref={textareaRef}
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none text-gray-900 placeholder-gray-400 leading-relaxed transition-all duration-200"
              placeholder="Edit your tweet..."
              rows={4}
            />
            {/* Character Count */}
            <div className="absolute bottom-3 right-3 text-xs font-medium">
              <span className={`
                ${isOverLimit ? 'text-red-600' : isNearLimit ? 'text-amber-600' : 'text-gray-400'}
              `}>
                {characterCount}/280
              </span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={handleSaveEdit}
                disabled={isOverLimit}
                className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
              >
                Save
              </button>
              <button
                onClick={handleCancelEdit}
                className="px-4 py-2 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                Cancel
              </button>
            </div>
            <span className="text-xs text-gray-500 font-medium">
              ⌘ + Enter to save, Esc to cancel
            </span>
          </div>
        </div>
      ) : (
        <div
          onClick={onStartEdit}
          className="cursor-text p-4 rounded-xl hover:bg-white/80 transition-all duration-200 border border-transparent hover:border-gray-100"
        >
          <p className="text-gray-900 leading-relaxed whitespace-pre-wrap text-[15px] tracking-tight">
            {cleanContent}
          </p>
          <div className="mt-3 text-xs text-gray-400 font-medium">
            {content.length} characters
          </div>
        </div>
      )}

      {/* Annotations Display */}
      {annotations.length > 0 && (
        <div className="mt-4 space-y-3">
          {annotations.map((annotation) => (
            <div
              key={annotation.id}
              className="bg-amber-50/50 border border-amber-200/60 rounded-xl p-4 backdrop-blur-sm"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-amber-700 uppercase tracking-wide">
                  {annotation.type}
                </span>
                <span className="text-xs text-gray-500 font-medium">
                  {annotation.timestamp.toLocaleTimeString()}
                </span>
              </div>
              <p className="text-sm text-amber-900 leading-relaxed">
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