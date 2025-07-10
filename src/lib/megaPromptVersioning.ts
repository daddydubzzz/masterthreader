// Types and utilities for megaprompt versioning

// Types for versioning system
export interface MegaPromptVersion {
  id: string;
  version: string;
  timestamp: Date;
  changes: MegaPromptChange[];
  author: 'user' | 'ai-suggestion';
  description: string;
  fileSnapshots: {
    core: string;
    style: string;
    examples: string;
    advanced: string;
  };
}

export interface MegaPromptChange {
  id: string;
  type: 'addition' | 'modification' | 'deletion';
  file: 'core' | 'style' | 'examples' | 'advanced';
  section?: string;
  oldContent?: string;
  newContent: string;
  reasoning: string;
  basedOnPattern?: string;
}

export interface MegaPromptSuggestion {
  id: string;
  changes: MegaPromptChange[];
  reasoning: string;
  confidence: number;
  basedOnPatterns: string[];
  previewContent: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: Date;
}

// Client-side utilities - file operations are handled server-side

// Generate megaprompt suggestions based on patterns
export function generateMegaPromptSuggestions(
  patterns: Array<{ original: string; annotation: string; final: string; frequency: number }>,
  recurringIssues: Array<{ pattern: string; frequency: number; suggestions: string[] }>
): MegaPromptSuggestion[] {
  const suggestions: MegaPromptSuggestion[] = [];
  
  // Analyze patterns for potential rules
  for (const pattern of patterns) {
    if (pattern.frequency >= 3) { // Only suggest if pattern appears 3+ times
      const suggestion: MegaPromptSuggestion = {
        id: `suggestion-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        changes: [{
          id: `change-${Date.now()}`,
          type: 'addition',
          file: 'advanced',
          section: 'QUALITY_ENHANCEMENT_RULES',
          newContent: `PATTERN-BASED RULE: ${pattern.annotation}\nExample: "${pattern.original}" → "${pattern.final}"\nApply this improvement pattern consistently across all threads.`,
          reasoning: `This pattern appears ${pattern.frequency} times in user feedback, indicating a consistent preference`
        }],
        reasoning: `User consistently makes this type of edit: ${pattern.annotation}`,
        confidence: Math.min(pattern.frequency / 5, 1), // Confidence based on frequency
        basedOnPatterns: [pattern.original],
        previewContent: `Would add rule: "${pattern.annotation}" to prevent similar issues`,
        status: 'pending',
        createdAt: new Date()
      };
      
      suggestions.push(suggestion);
    }
  }
  
  // Analyze recurring issues
  for (const issue of recurringIssues) {
    if (issue.frequency >= 2) {
      const suggestion: MegaPromptSuggestion = {
        id: `suggestion-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        changes: [{
          id: `change-${Date.now()}`,
          type: 'addition',
          file: 'style',
          section: 'COMMON_ISSUES_PREVENTION',
          newContent: `AVOID: "${issue.pattern}"\nInstead: ${issue.suggestions.join(' or ')}\nReason: This pattern frequently requires user correction.`,
          reasoning: `This issue appears ${issue.frequency} times and needs prevention`
        }],
        reasoning: `Recurring issue that needs prevention: ${issue.pattern}`,
        confidence: Math.min(issue.frequency / 3, 1),
        basedOnPatterns: [issue.pattern],
        previewContent: `Would add prevention rule for: "${issue.pattern}"`,
        status: 'pending',
        createdAt: new Date()
      };
      
      suggestions.push(suggestion);
    }
  }
  
  return suggestions;
}

// Accept suggestion and apply changes (placeholder)
export function acceptMegaPromptSuggestion(): MegaPromptVersion {
  // In a real implementation, this would load the suggestion from storage
  // For now, we'll return a placeholder
  throw new Error('Suggestion acceptance not yet implemented - needs integration with suggestion storage');
}

// Initialize versioning system (client-side placeholder)
export function initializeMegaPromptVersioning(): void {
  // Client-side initialization - actual versioning happens server-side
  console.log('Megaprompt versioning initialized on client');
} 