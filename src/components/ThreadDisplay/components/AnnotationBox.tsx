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
    <div className="absolute top-0 left-0 right-0 bg-white border border-gray-300 rounded-lg shadow-lg p-4 z-10">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-medium text-gray-900">Add Comment</h4>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Comment Type
          </label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as Annotation['type'])}
            className="w-full p-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="improvement">Improvement</option>
            <option value="clarification">Clarification</option>
            <option value="style">Style</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Your Comment
          </label>
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="What would you like to improve about this tweet?"
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            rows={3}
          />
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">
            ⌘ + Enter to save, Esc to cancel
          </span>
          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 bg-gray-200 text-gray-700 text-sm rounded-md hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!text.trim()}
              className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Save Comment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 