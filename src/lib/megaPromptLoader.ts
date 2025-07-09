import fs from 'fs';
import path from 'path';

export function loadMegaPrompt(): string {
  const rootDir = process.cwd();
  
  try {
    // Load all the component files
    const coreInstructions = fs.readFileSync(
      path.join(rootDir, 'megaprompt-core.txt'), 
      'utf-8'
    );
    
    const styleRules = fs.readFileSync(
      path.join(rootDir, 'megaprompt-style-rules.txt'), 
      'utf-8'
    );
    
    const examples = fs.readFileSync(
      path.join(rootDir, 'megaprompt-examples.txt'), 
      'utf-8'
    );
    
    const advancedRules = fs.readFileSync(
      path.join(rootDir, 'megaprompt-advanced-rules.txt'), 
      'utf-8'
    );
    
    // Combine them in the logical order
    const megaPrompt = [
      coreInstructions,
      '',
      styleRules,
      '',
      examples,
      '',
      advancedRules
    ].join('\n');
    
    return megaPrompt;
    
  } catch (error) {
    console.error('Error loading mega prompt files:', error);
    
    // Fallback to original megaprompt.txt if it exists
    try {
      const fallback = fs.readFileSync(
        path.join(rootDir, 'megaprompt.txt'), 
        'utf-8'
      );
      console.warn('Using fallback megaprompt.txt');
      return fallback;
    } catch (fallbackError) {
      console.error('Fallback failed:', fallbackError);
      throw new Error('Could not load mega prompt from any source');
    }
  }
}

export function saveCombinedMegaPrompt(): void {
  const rootDir = process.cwd();
  const combinedPrompt = loadMegaPrompt();
  
  fs.writeFileSync(
    path.join(rootDir, 'megaprompt-combined.txt'),
    combinedPrompt,
    'utf-8'
  );
  
  console.log('Combined mega prompt saved to megaprompt-combined.txt');
} 