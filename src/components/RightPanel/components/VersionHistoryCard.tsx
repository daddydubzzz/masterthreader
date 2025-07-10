'use client';

import { useState } from 'react';
import { MegaPromptVersion } from '@/lib/megaPromptVersioning';

interface VersionHistoryCardProps {
  version: MegaPromptVersion;
  isLatest: boolean;
  onRollback: (versionId: string) => void;
}

export function VersionHistoryCard({
  version,
  isLatest,
  onRollback
}: VersionHistoryCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isRollingBack, setIsRollingBack] = useState(false);

  const handleRollback = async () => {
    if (isLatest) return; // Can't rollback to current version
    
    setIsRollingBack(true);
    try {
      await onRollback(version.id);
    } finally {
      setIsRollingBack(false);
    }
  };

  const getAuthorIcon = (author: string) => {
    return author === 'user' ? '👤' : '🤖';
  };

  const getChangeTypeIcon = (type: string) => {
    switch (type) {
      case 'addition': return '➕';
      case 'modification': return '✏️';
      case 'deletion': return '➖';
      default: return '📝';
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className={`bg-white rounded-lg border p-4 ${isLatest ? 'border-blue-300 bg-blue-50' : 'border-gray-200'} hover:shadow-md transition-shadow`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
              isLatest ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
            }`}>
              {version.version}
            </span>
            <span className="text-xs text-gray-500">
              {getAuthorIcon(version.author)} {version.author}
            </span>
            {isLatest && (
              <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700">
                Current
              </span>
            )}
          </div>
          <h3 className="text-sm font-medium text-gray-900 mb-1">
            {version.description}
          </h3>
          <p className="text-xs text-gray-600">
            {formatDate(version.timestamp)} • {version.changes.length} change{version.changes.length !== 1 ? 's' : ''}
          </p>
        </div>
        
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="ml-2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg 
            className={`w-4 h-4 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="space-y-3 mb-4">
          {/* Changes List */}
          <div className="bg-gray-50 rounded-lg p-3">
            <h4 className="text-xs font-medium text-gray-700 mb-2">Changes in this version:</h4>
            <div className="space-y-2">
              {version.changes.map((change) => (
                <div key={change.id} className="text-xs">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">
                      {getChangeTypeIcon(change.type)} {change.file}
                    </span>
                    <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${
                      change.type === 'addition' ? 'bg-green-100 text-green-700' :
                      change.type === 'modification' ? 'bg-blue-100 text-blue-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {change.type}
                    </span>
                    {change.section && (
                      <span className="text-gray-500">→ {change.section}</span>
                    )}
                  </div>
                  <p className="text-gray-600 ml-4">{change.reasoning}</p>
                  {change.basedOnPattern && (
                    <p className="text-blue-600 ml-4 text-xs">
                      Based on: &quot;{change.basedOnPattern}&quot;
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* File Snapshots Info */}
          <div className="bg-blue-50 rounded-lg p-3">
            <h4 className="text-xs font-medium text-blue-700 mb-2">Files in this version:</h4>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(version.fileSnapshots).map(([file, content]) => (
                <div key={file} className="text-xs">
                  <span className="font-medium text-blue-600">
                    {file}: {content.length} chars
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      {!isLatest && (
        <div className="flex gap-2">
          <button
            onClick={handleRollback}
            disabled={isRollingBack}
            className="flex-1 px-3 py-1.5 bg-orange-600 text-white text-xs font-medium rounded hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isRollingBack ? 'Rolling back...' : 'Rollback to this version'}
          </button>
        </div>
      )}
    </div>
  );
} 