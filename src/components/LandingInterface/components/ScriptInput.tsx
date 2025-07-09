'use client';

import { ScriptInputProps } from '../types';

export function ScriptInput({ 
  value, 
  onChange, 
  placeholder = "Paste your script or content here to transform into engaging Twitter threads...",
  disabled = false 
}: ScriptInputProps) {
  return (
    <div className="space-y-2">
      <label htmlFor="script-input" className="block text-sm font-medium text-gray-700">
        Your Script
      </label>
      <textarea
        id="script-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        rows={8}
        className="w-full p-4 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-vertical disabled:bg-gray-100 disabled:cursor-not-allowed"
      />
      <p className="text-xs text-gray-500">
        Paste any content you want to transform into Twitter threads
      </p>
    </div>
  );
} 