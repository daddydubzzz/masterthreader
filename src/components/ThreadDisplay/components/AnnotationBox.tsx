'use client';

import { useState, useRef, useEffect } from 'react';
import { AnnotationBoxProps } from '../types';
import { Annotation } from '@/types';

const ANNOTATION_TYPES = [
  { value: 'improvement', label: '💡 Improvement', description: 'Suggest better wording or approach' },
  { value: 'tone', label: '🎭 Tone', description: 'Adjust voice, emotion, or personality' },
  { value: 'engagement', label: '🚀 Engagement', description: 'Make it more compelling or interactive' },
  { value: 'clarification', label: '🔍 Clarification', description: 'Improve readability and understanding' },
  { value: 'structure', label: '🏗️ Structure', description: 'Reorganize flow or formatting' },
  { value: 'accuracy', label: '✅ Accuracy', description: 'Fix facts or correct information' },
  { value: 'style', label: '✨ Style', description: 'Enhance writing style or formatting' },
  { value: 'general', label: '💬 General', description: 'Other feedback or suggestions' }
] as const;

export function AnnotationBox({
  isOpen,
  onClose,
  onSave,
  existingAnnotations
}: AnnotationBoxProps) {
  const [text, setText] = useState('');
  const [type, setType] = useState<Annotation['type']>('improvement');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && textareaRef.current) {
      // Focus textarea after a small delay to ensure modal is fully rendered
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSave = () => {
    if (text.trim()) {
      onSave(text.trim(), type);
      setText('');
      setType('improvement');
      onClose();
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

  const selectedType = ANNOTATION_TYPES.find(t => t.value === type) || ANNOTATION_TYPES[0];

  // Get suggested placeholder based on existing annotations
  const getSuggestedPlaceholder = (selectedType: typeof ANNOTATION_TYPES[number]) => {
    const baseText = `What ${selectedType.label.toLowerCase().replace(/[^\w\s]/g, '')} would you suggest?`;
    
    if (existingAnnotations.length === 0) {
      return baseText;
    }
    
    const sameTypeAnnotations = existingAnnotations.filter(a => a.type === selectedType.value);
    if (sameTypeAnnotations.length > 0) {
      return `Add another ${selectedType.label.toLowerCase().replace(/[^\w\s]/g, '')} suggestion...`;
    }
    
    return baseText;
  };

  if (!isOpen) return null;

  return (
    <div className="absolute top-0 left-0 right-0 bg-white border border-gray-200 rounded-2xl shadow-2xl p-6 z-30 animate-slide-up">
      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h4 className="text-lg font-semibold text-gray-900">Add Comment</h4>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all duration-200"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {/* Comment Type Dropdown */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Comment Type
          </label>
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full flex items-center justify-between p-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 bg-white hover:bg-gray-50"
            >
              <div className="flex items-center gap-2">
                <span>{selectedType.label}</span>
                <span className="text-gray-500 text-xs">- {selectedType.description}</span>
              </div>
              <svg 
                className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {isDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-40 max-h-64 overflow-y-auto">
                {ANNOTATION_TYPES.map((annotationType) => (
                  <button
                    key={annotationType.value}
                    type="button"
                    onClick={() => {
                      setType(annotationType.value as Annotation['type']);
                      setIsDropdownOpen(false);
                    }}
                    className={`w-full text-left p-3 hover:bg-gray-50 transition-colors duration-150 first:rounded-t-xl last:rounded-b-xl ${
                      type === annotationType.value ? 'bg-blue-50 text-blue-900' : 'text-gray-900'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{annotationType.label}</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {annotationType.description}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Comment Text */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Your Comment
          </label>
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={getSuggestedPlaceholder(selectedType)}
            className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none transition-all duration-200 placeholder-gray-400 text-gray-900"
            rows={4}
          />
          <div className="mt-2 text-xs text-gray-500">
            Be specific about what you&apos;d like to change and why.
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-2">
          <span className="text-xs text-gray-500">
            ⌘ + Enter to save, Esc to cancel
          </span>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200 transition-colors duration-200 font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!text.trim()}
              className="px-5 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200 font-medium shadow-sm"
            >
              Save Comment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 