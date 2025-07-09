'use client';

import { useState, useRef, useEffect } from 'react';
import { AnnotationBoxProps } from '../types';
import { Annotation } from '@/types';

export function AnnotationBox({
  isOpen,
  onClose,
  onSave
}: AnnotationBoxProps) {
  const [text, setText] = useState('');
  const [type, setType] = useState<Annotation['type']>('improvement');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isOpen && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isOpen]);

  const handleSave = () => {
    if (text.trim()) {
      onSave(text.trim(), type);
      setText('');
      setType('improvement');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.metaKey) {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="absolute top-0 left-0 right-0 bg-white border border-gray-200/80 rounded-2xl shadow-xl p-6 z-20 backdrop-blur-sm">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-lg font-medium text-gray-900">Add Comment</h4>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Comment Type
          </label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as Annotation['type'])}
            className="w-full p-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
          >
            <option value="improvement">💡 Improvement</option>
            <option value="clarification">❓ Clarification</option>
            <option value="style">✨ Style</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Your Comment
          </label>
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="What would you like to improve about this tweet?"
            className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none transition-all duration-200 placeholder-gray-400"
            rows={3}
          />
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500 font-medium">
            ⌘ + Enter to save, Esc to cancel
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!text.trim()}
              className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
            >
              Save Comment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 