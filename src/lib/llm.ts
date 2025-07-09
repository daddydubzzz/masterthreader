import { 
  Thread, 
  MegaPrompt, 
  RecursionPayload, 
  RecursionResponse,
  LLMThreadResponse
} from '@/types';

// LLM Provider Types
export type LLMProvider = 'openai' | 'anthropic';

export interface LLMConfig {
  provider: LLMProvider;
  apiKey: string;
  model?: string;
}

export interface LLMClient {
  generateThreads(script: string, megaPrompt: MegaPrompt): Promise<Thread[]>;
  performRecursion(payload: RecursionPayload): Promise<RecursionResponse>;
}

// OpenAI Implementation (for dev/testing)
class OpenAIClient implements LLMClient {
  private config: LLMConfig;

  constructor(config: LLMConfig) {
    this.config = config;
  }

  async generateThreads(script: string, megaPrompt: MegaPrompt): Promise<Thread[]> {
    const OpenAI = (await import('openai')).default;
    const openai = new OpenAI({ apiKey: this.config.apiKey });

    // Combine Josh's mega prompt with the script exactly as he does
    const combinedPrompt = `${megaPrompt.content}

${script}`;

    // Force structured JSON response with specific format
    const systemPrompt = `You are an expert at following detailed instructions precisely. You must respond with valid JSON in exactly this format:

{
  "threads": [
    {
      "title": "Thread 1 Title", 
      "tweets": [
        {
          "content": "Tweet content with proper formatting using em-dashes between tweets",
          "characterCount": 180
        }
      ],
      "conceptBlocksUsed": ["A", "C", "F"]
    }
  ],
  "conceptBlocks": [
    {
      "id": "A",
      "content": "Concept description",
      "used": true
    }
  ]
}

Critical formatting requirements:
- Use "—" (em-dash) to separate tweets, not "---"
- End first tweet with 🧵👇 
- Keep tweets between 120-280 characters
- Follow ALL instructions in the mega prompt exactly
- Create exactly 3 threads with different angles
- Count characters accurately`;

    try {
      const response = await openai.chat.completions.create({
        model: this.config.model || 'gpt-4',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user', 
            content: combinedPrompt
          }
        ],
        temperature: 0.3,
        max_tokens: 4000,
        response_format: { type: "json_object" }
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('Empty response from OpenAI');
      }

      // Parse structured response
      const structuredResponse: LLMThreadResponse = JSON.parse(content);
      
      // Convert to Thread format for existing UI
      return this.convertStructuredToThreads(structuredResponse);

    } catch (error) {
      console.error('OpenAI generation error:', error);
      throw new Error('Failed to generate threads');
    }
  }

  private convertStructuredToThreads(structuredResponse: LLMThreadResponse): Thread[] {
    return structuredResponse.threads.map((structuredThread, index) => {
      // Convert structured tweets back to single content string with em-dash separators
      const content = structuredThread.tweets
        .map(tweet => tweet.content)
        .join('\n\n—\n\n');

      return {
        id: `thread-${index + 1}`,
        content,
        edits: [],
        annotations: []
      };
    });
  }

  async performRecursion(payload: RecursionPayload): Promise<RecursionResponse> {
    const OpenAI = (await import('openai')).default;
    const openai = new OpenAI({ apiKey: this.config.apiKey });

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

    const recursionPrompt = `You are an AI prompt engineering expert specializing in Josh's Twitter thread creation system.

ORIGINAL SCRIPT:
"""
${payload.originalScript}
"""

USER EDITS AND ANNOTATIONS:
"""
${editsAndAnnotations}
"""

CURRENT MEGA PROMPT VERSION: ${payload.megaPromptVersion}

Analyze Josh's editing patterns and provide:
1. Updated threads incorporating his specific feedback patterns
2. New prompt rules that capture his preferences

Respond with valid JSON:
{
  "updatedThreads": [
    {
      "id": "thread-1",
      "content": "Updated thread with em-dash separators"
    }
  ],
  "suggestedRules": [
    {
      "id": "rule-new-1", 
      "content": "New rule based on Josh's feedback patterns",
      "category": "improvement",
      "reasoning": "Why this rule helps based on his edits"
    }
  ]
}`;

    try {
      const response = await openai.chat.completions.create({
        model: this.config.model || 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are an expert prompt engineer analyzing user feedback patterns. Always respond with valid JSON.'
          },
          {
            role: 'user',
            content: recursionPrompt
          }
        ],
        temperature: 0.3,
        max_tokens: 3000,
        response_format: { type: "json_object" }
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('Empty response from OpenAI');
      }

      return JSON.parse(content);

    } catch (error) {
      console.error('OpenAI recursion error:', error);
      throw new Error('Failed to perform recursion analysis');
    }
  }
}

// Anthropic Implementation (for Josh's production use with Opus 4)
class AnthropicClient implements LLMClient {
  private config: LLMConfig;

  constructor(config: LLMConfig) {
    this.config = config;
  }

  async generateThreads(script: string, megaPrompt: MegaPrompt): Promise<Thread[]> {
    const Anthropic = (await import('@anthropic-ai/sdk')).default;
    const anthropic = new Anthropic({
      apiKey: this.config.apiKey,
    });

    // Add structured output requirement to the mega prompt
    const structuredPrompt = `${megaPrompt.content}

CRITICAL: You must respond with valid JSON in exactly this format:

{
  "threads": [
    {
      "title": "Brief thread description",
      "tweets": [
        {
          "content": "Tweet content",
          "characterCount": 180
        }
      ]
    }
  ]
}

Requirements:
- Create exactly 3 threads
- Each tweet 120-280 characters 
- Use em-dash (—) separators between tweets
- End first tweet with 🧵👇
- Return ONLY valid JSON, no other text

Script to convert:
${script}`;

    try {
      const response = await anthropic.messages.create({
        model: this.config.model || 'claude-3-5-sonnet-20241022',
        max_tokens: 4000,
        temperature: 0.3,
        messages: [
          {
            role: 'user',
            content: structuredPrompt
          }
        ]
      });

      const content = response.content[0];
      if (content.type !== 'text') {
        throw new Error('Unexpected response format from Anthropic');
      }

      // Parse JSON response
      return this.parseAnthropicResponse(content.text);

    } catch (error) {
      console.error('Anthropic generation error:', error);
      throw new Error('Failed to generate threads with Anthropic');
    }
  }

  private parseAnthropicResponse(content: string): Thread[] {
    try {
      // Extract JSON from response (in case there's extra text)
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      const structuredResponse: LLMThreadResponse = JSON.parse(jsonMatch[0]);
      
      // Convert structured response to Thread format
      return structuredResponse.threads.map((structuredThread, index) => {
        // Join tweets with proper em-dash separators
        const content = structuredThread.tweets
          .map(tweet => tweet.content)
          .join('\n\n—\n\n');

        return {
          id: `thread-${index + 1}`,
          content,
          edits: [],
          annotations: []
        };
      });

    } catch (error) {
      console.error('Failed to parse Anthropic JSON response:', error);
      console.log('Raw content:', content);
      
      // Fallback to simple text parsing if JSON parsing fails
      const threadSections = content.split(/THREAD\s*\d*:?/i).filter(section => section.trim());
      
      return threadSections.slice(0, 3).map((section, index) => ({
        id: `thread-${index + 1}`,
        content: section.trim(),
        edits: [],
        annotations: []
      }));
    }
  }

  async performRecursion(): Promise<RecursionResponse> {
    // TODO: Implement Anthropic recursion - similar to OpenAI but using Claude's format
    throw new Error('Anthropic recursion not yet implemented');
  }
}

// Factory function to create the appropriate LLM client
export function createLLMClient(): LLMClient {
  const provider = (process.env.LLM_PROVIDER as 'openai' | 'anthropic') || 'anthropic';
  
  const config: LLMConfig = {
    provider,
    apiKey: provider === 'openai' 
      ? process.env.OPENAI_API_KEY || ''
      : process.env.ANTHROPIC_API_KEY || '',
    model: provider === 'openai' ? 'gpt-4' : 'claude-3-5-sonnet-20241022'
  };

  if (!config.apiKey) {
    throw new Error(`${provider.toUpperCase()} API key not configured`);
  }

  switch (provider) {
    case 'openai':
      return new OpenAIClient(config);
    case 'anthropic':
      return new AnthropicClient(config);
    default:
      throw new Error(`Unsupported LLM provider: ${provider}`);
  }
} 