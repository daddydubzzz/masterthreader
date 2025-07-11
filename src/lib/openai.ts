import OpenAI from 'openai';
import { Thread, MegaPrompt, RecursionPayload, RecursionResponse } from '@/types';

// OpenAI Configuration
export const openaiConfig = {
  model: 'text-embedding-3-large',
  dimensions: 2000, // Reduced from 3072 to work with Supabase pgvector 2000 dimension limit
  maxRetries: 3,
  timeout: 30000
};

// Initialize OpenAI client conditionally
function getOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    throw new Error('OpenAI API key is required but not provided');
  }
  
  return new OpenAI({
    apiKey,
  });
}

export async function generateThreads(
  script: string, 
  megaPrompt: MegaPrompt
): Promise<Thread[]> {
  try {
    const prompt = `${megaPrompt.content}

SCRIPT TO TRANSFORM:
"""
${script}
"""

Please create exactly 3 Twitter thread variations as specified above. Format your response as JSON with this structure:
{
  "threads": [
    {
      "id": "thread-1",
      "content": "Full thread content with numbered tweets",
      "approach": "story-driven"
    },
    {
      "id": "thread-2", 
      "content": "Full thread content with numbered tweets",
      "approach": "data-driven"
    },
    {
      "id": "thread-3",
      "content": "Full thread content with numbered tweets", 
      "approach": "actionable"
    }
  ]
}`;

    const openai = getOpenAIClient();
    const response = await openai.chat.completions.create({
      model: 'gpt-4', // Using GPT-4 as it's the latest available model
      messages: [
        {
          role: 'system',
          content: 'You are an expert Twitter thread creator. Always respond with valid JSON.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.8,
      max_tokens: 2000
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    
    return result.threads.map((thread: { id: string; content: string; approach: string }) => ({
      id: thread.id,
      content: thread.content,
      edits: [],
      annotations: []
    }));

  } catch (error) {
    console.error('Error generating threads:', error);
    throw new Error('Failed to generate threads');
  }
}

export async function performRecursion(
  payload: RecursionPayload
): Promise<RecursionResponse> {
  try {
    const editsAndAnnotations = payload.threads
      .map(thread => {
        const edits = thread.edits.map(edit => 
          `Edit: "${edit.originalText}" → "${edit.editedText}"`
        ).join('\n');
        
        const annotations = thread.annotations.map(annotation =>
          `${annotation.type.toUpperCase()}: ${annotation.text}`
        ).join('\n');
        
        return `Thread ${thread.id}:\n${edits}\n${annotations}`;
      })
      .join('\n\n');

    const recursionPrompt = `You are an AI prompt engineering expert. Based on the user's edits and annotations below, suggest improvements to the mega prompt and provide updated thread versions.

ORIGINAL SCRIPT:
"""
${payload.originalScript}
"""

USER EDITS AND ANNOTATIONS:
"""
${editsAndAnnotations}
"""

CURRENT MEGA PROMPT VERSION: ${payload.megaPromptVersion}

Please analyze the patterns in the user's feedback and suggest:
1. Updated versions of the 3 threads incorporating the feedback
2. New prompt rules that should be added to improve future generations

Format your response as JSON:
{
  "updatedThreads": [
    {
      "id": "thread-1",
      "content": "Updated thread content"
    },
    // ... more threads
  ],
  "suggestedRules": [
    {
      "id": "rule-new-1",
      "content": "New rule based on user feedback",
      "category": "improvement",
      "reasoning": "Why this rule helps"
    }
    // ... more rules
  ]
}`;

    const openai = getOpenAIClient();
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are an expert prompt engineer. Always respond with valid JSON.'
        },
        {
          role: 'user',
          content: recursionPrompt
        }
      ],
      temperature: 0.3,
      max_tokens: 3000
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    
    return {
      updatedThreads: result.updatedThreads.map((thread: { id: string; content: string }) => ({
        id: thread.id,
        content: thread.content,
        edits: [],
        annotations: []
      })),
      suggestedRules: result.suggestedRules.map((rule: { id: string; content: string; category: string }) => ({
        id: rule.id,
        content: rule.content,
        category: rule.category,
        accepted: false,
        source: 'ai-suggestion' as const
      }))
    };

  } catch (error) {
    console.error('Error performing recursion:', error);
    throw new Error('Failed to perform recursion');
  }
} 