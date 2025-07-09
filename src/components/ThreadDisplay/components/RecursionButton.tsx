'use client';

import { RecursionButtonProps } from '../types';

export function RecursionButton({ visible, onClick, isLoading = false }: RecursionButtonProps) {
  if (!visible) return null;

  return (
    <div className="flex justify-center mt-8">
      <button
        onClick={onClick}
        disabled={isLoading}
        className={`px-8 py-4 text-lg font-semibold rounded-lg transition-all duration-200 ${
          isLoading
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
        }`}
      >
        {isLoading ? (
          <div className="flex items-center space-x-3">
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span>Running Recursion...</span>
          </div>
        ) : (
          <div className="flex items-center space-x-3">
            <span>🔄</span>
            <span>Run Recursion</span>
          </div>
        )}
      </button>
    </div>
  );
} 