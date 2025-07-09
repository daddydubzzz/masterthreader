'use client';

import { useState } from 'react';
import { ScriptInputProps } from '../types';

export function ScriptInput({ 
  value, 
  onChange, 
  placeholder = "Paste your script, blog post, or any content here to transform into engaging Twitter threads...",
  disabled = false 
}: ScriptInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const characterCount = value.length;
  const wordCount = value.trim() ? value.trim().split(/\s+/).length : 0;

  return (
    <div className="space-y-4">
      <div className="relative">
        <textarea
          id="script-input"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          disabled={disabled}
          rows={12}
          className={`textarea text-base leading-relaxed transition-all duration-300 resize-none ${
            isFocused ? 'ring-2 ring-blue-500/30 border-blue-500 shadow-lg' : ''
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        />
        
        {/* Character Counter */}
        <div className="absolute bottom-4 right-4 flex items-center gap-3 text-xs">
          <div className="bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full border border-gray-200 shadow-sm">
            <span className="font-medium text-gray-600">
              {wordCount} words
            </span>
          </div>
          <div className="bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full border border-gray-200 shadow-sm">
            <span className="font-medium text-gray-600">
              {characterCount} chars
            </span>
          </div>
        </div>
      </div>
      
      {/* Help Text */}
      <div className="flex items-start gap-3 text-sm text-gray-600">
        <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0">
          <svg className="w-3 h-3 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="leading-relaxed">
          <strong className="font-medium text-gray-700">Pro tip:</strong> Include key points, statistics, or stories you want to highlight. 
                     The AI will automatically optimize your content for maximum engagement and Twitter&apos;s algorithm.
        </p>
      </div>
    </div>
  );
} 