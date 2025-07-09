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
    <div className="relative w-full">
      <textarea
        id="script-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={placeholder}
        disabled={disabled}
        rows={12}
        className={`textarea w-full text-base leading-relaxed ${
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
  );
} 