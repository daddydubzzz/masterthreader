'use client';

import { GenerateButtonProps } from '../types';

export function GenerateButton({
  onClick,
  isLoading = false,
  disabled = false
}: GenerateButtonProps) {
  const isDisabled = disabled || isLoading;

  return (
    <button
      onClick={onClick}
      disabled={isDisabled}
      className={`w-full px-6 py-4 text-lg font-semibold rounded-lg transition-all duration-200 ${
        isDisabled
          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
          : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
      }`}
    >
      {isLoading ? (
        <div className="flex items-center justify-center space-x-2">
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          <span>Generating Threads...</span>
        </div>
      ) : (
        'Generate Threads'
      )}
    </button>
  );
} 