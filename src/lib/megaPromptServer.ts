// Server-side only utilities for mega prompt file loading
// This file should only be imported in API routes and server components

// Default mega prompt content fallback
const DEFAULT_MEGA_PROMPT_CONTENT = `Create 3 distinct Twitter threads from the provided script.
Each thread should be 6-20 tweets long, with compelling hooks and natural cliffhangers.
Focus on different angles: story-driven, data-driven, and actionable approaches.
Follow proper formatting with em-dash separators between tweets.
End first tweet with 🧵👇 to indicate thread continues.`;

// Server-side function to load mega prompt from modular files
export function loadMegaPromptFromFile(): string {
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