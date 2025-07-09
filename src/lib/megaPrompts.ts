import { MegaPrompt, PromptRule } from '@/types';

// Default mega prompt content based on Josh's requirements
const DEFAULT_MEGA_PROMPT_CONTENT = `Create 3 distinct Twitter threads from the provided script.
Each thread should be 6-20 tweets long, with compelling hooks and natural cliffhangers.
Focus on different angles: story-driven, data-driven, and actionable approaches.
Follow proper formatting with em-dash separators between tweets.
End first tweet with 🧵👇 to indicate thread continues.`;

// Josh's V1 Mega Prompt (will be loaded from file in API routes)
export const MEGA_PROMPT_V1: MegaPrompt = {
  version: 'v1.0',
  content: DEFAULT_MEGA_PROMPT_CONTENT, // Will be replaced by actual content from API
  rules: [
    {
      id: 'rule-v1-1',
      content: 'Create exactly 3 distinct Twitter threads with different angles',
      category: 'structure',
      accepted: true,
      source: 'josh'
    },
    {
      id: 'rule-v1-2',
      content: 'Each thread should be 6-20 tweets long with natural cliffhangers',
      category: 'structure', 
      accepted: true,
      source: 'josh'
    },
    {
      id: 'rule-v1-3',
      content: 'Use em-dash separators between tweets for proper formatting',
      category: 'formatting',
      accepted: true,
      source: 'josh'
    },
    {
      id: 'rule-v1-4',
      content: 'End first tweet with 🧵👇 to indicate thread continues',
      category: 'formatting',
      accepted: true,
      source: 'josh'
    },
    {
      id: 'rule-v1-5',
      content: 'Focus on neuroscience-backed insights with specific mechanisms',
      category: 'content',
      accepted: true,
      source: 'josh'
    }
  ],
  createdAt: new Date('2025-01-01')
};

// Available mega prompt versions
export const AVAILABLE_MEGA_PROMPTS: Record<string, MegaPrompt> = {
  'v1.0': MEGA_PROMPT_V1
};

// Storage for dynamically created versions (in production, this would be database)
const dynamicMegaPrompts: Record<string, MegaPrompt> = {};

// Get specific mega prompt version
export function getMegaPrompt(version: string): MegaPrompt | null {
  return AVAILABLE_MEGA_PROMPTS[version] || dynamicMegaPrompts[version] || null;
}

// Get latest mega prompt version
export function getLatestMegaPrompt(): MegaPrompt {
  const allVersions = { ...AVAILABLE_MEGA_PROMPTS, ...dynamicMegaPrompts };
  const versions = Object.keys(allVersions).sort();
  const latestVersion = versions[versions.length - 1];
  return allVersions[latestVersion];
}

// Server-side function to load mega prompt from modular files
export function loadMegaPromptFromFile(): string {
  // Only use this function on server side
  if (typeof window !== 'undefined') {
    console.warn('loadMegaPromptFromFile should only be called on server side');
    return DEFAULT_MEGA_PROMPT_CONTENT;
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { readFileSync } = require('fs');
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { join } = require('path');
    
    // Try to load from modular files first
    try {
      const coreInstructions = readFileSync(join(process.cwd(), 'megaprompt-core.txt'), 'utf-8');
      const styleRules = readFileSync(join(process.cwd(), 'megaprompt-style-rules.txt'), 'utf-8');
      const examples = readFileSync(join(process.cwd(), 'megaprompt-examples.txt'), 'utf-8');
      const advancedRules = readFileSync(join(process.cwd(), 'megaprompt-advanced-rules.txt'), 'utf-8');
      
      // Combine them in logical order
      return [coreInstructions, styleRules, examples, advancedRules].join('\n\n');
    } catch {
      console.warn('Modular mega prompt files not found, falling back to megaprompt.txt');
      
      // Fallback to original single file
      const megaPromptPath = join(process.cwd(), 'megaprompt.txt');
      return readFileSync(megaPromptPath, 'utf8');
    }
  } catch (error) {
    console.error('Failed to load mega prompt from any source:', error);
    return DEFAULT_MEGA_PROMPT_CONTENT;
  }
}

// Create new mega prompt version with additional rules
export function createNewMegaPromptVersion(
  baseMegaPrompt: MegaPrompt,
  newRules: PromptRule[]
): MegaPrompt {
  const versionNumber = parseFloat(baseMegaPrompt.version.substring(1)) + 0.1;
  const newVersion = `v${versionNumber.toFixed(1)}`;
  
  const newMegaPrompt: MegaPrompt = {
    version: newVersion,
    content: baseMegaPrompt.content, // Keep core content the same for now
    rules: [...baseMegaPrompt.rules, ...newRules.map(rule => ({ ...rule, accepted: true }))],
    createdAt: new Date()
  };
  
  return newMegaPrompt;
}

// Add new mega prompt version to available versions
export function addMegaPromptVersion(megaPrompt: MegaPrompt): void {
  dynamicMegaPrompts[megaPrompt.version] = megaPrompt;
}

// Get all available mega prompt versions
export function getAllMegaPromptVersions(): string[] {
  return [...Object.keys(AVAILABLE_MEGA_PROMPTS), ...Object.keys(dynamicMegaPrompts)].sort();
} 