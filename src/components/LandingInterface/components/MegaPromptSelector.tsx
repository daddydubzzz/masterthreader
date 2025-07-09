'use client';

import { MegaPromptSelectorProps } from '../types';

export function MegaPromptSelector({
  selectedVersion,
  onVersionChange,
  availableVersions,
  disabled = false
}: MegaPromptSelectorProps) {
  return (
    <div className="space-y-2">
      <label htmlFor="mega-prompt-selector" className="block text-sm font-medium text-gray-700">
        Mega Prompt Version
      </label>
      <select
        id="mega-prompt-selector"
        value={selectedVersion}
        onChange={(e) => onVersionChange(e.target.value)}
        disabled={disabled}
        className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
      >
        {availableVersions.map((version) => (
          <option key={version} value={version}>
            {version} {version === 'v1.0' ? '(Default)' : ''}
          </option>
        ))}
      </select>
      <p className="text-xs text-gray-500">
        Choose the prompt version that defines how threads are generated
      </p>
    </div>
  );
} 