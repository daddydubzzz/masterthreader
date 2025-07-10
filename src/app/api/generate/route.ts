import { NextRequest, NextResponse } from 'next/server';
import { createLLMClient } from '@/lib/llm';
import { getMegaPrompt } from '@/lib/megaPrompts';
import { loadMegaPromptFromFile } from '@/lib/megaPromptServer';
import { getContextualExamples } from '@/lib/vectorDB';
import { GenerationRequest, GenerationResponse } from '@/types';
import { ValidationError, validateRequired, validateStringLength, ErrorLogger } from '@/lib/errorHandling';

export async function POST(request: NextRequest) {
  try {
    const body: GenerationRequest = await request.json();
    const { script, megaPromptVersion } = body;

    // Validate input with comprehensive validation
    try {
      validateRequired(script, 'Script');
      validateStringLength(script.trim(), 'Script', 50000); // Maximum 50k characters
      validateRequired(megaPromptVersion, 'Mega prompt version');
    } catch (error) {
      if (error instanceof ValidationError) {
        return NextResponse.json(
          { error: error.message },
          { status: 400 }
        );
      }
      throw error;
    }

    // Get the specified mega prompt version
    const megaPrompt = getMegaPrompt(megaPromptVersion);
    if (!megaPrompt) {
      return NextResponse.json(
        { error: `Mega prompt version ${megaPromptVersion} not found` },
        { status: 404 }
      );
    }

    // Load actual mega prompt content from file
    const actualMegaPromptContent = loadMegaPromptFromFile();
    
    // Get contextual examples from RAG system for better first-pass quality
    let contextualExamples: Array<{
      original: string;
      annotation: string;
      improved: string;
    }> = [];
    try {
      const examples = await getContextualExamples(script, 3); // Get top 3 examples
      contextualExamples = examples.map(example => ({
        original: example.original_tweet,
        annotation: example.annotation,
        improved: example.final_edit
      }));
    } catch (error) {
      console.warn('Failed to get contextual examples:', error);
      // Continue without examples - don't fail the generation
    }

    // Build enhanced mega prompt with RAG context
    const ragEnhancedContent = contextualExamples.length > 0 
      ? `${actualMegaPromptContent}

CONTEXTUAL EXAMPLES FROM PAST EDITS:
${contextualExamples.map((ex, i) => `
Example ${i + 1}:
Original: "${ex.original}"
User feedback: "${ex.annotation}"
Final version: "${ex.improved}"
`).join('')}

Use these examples to understand user preferences and create better first-pass threads that match their style and requirements.`
      : actualMegaPromptContent;

    const megaPromptWithActualContent = {
      ...megaPrompt,
      content: ragEnhancedContent
    };

    // Generate threads using pluggable LLM backend with RAG context
    const llmClient = createLLMClient();
    const threads = await llmClient.generateThreads(script, megaPromptWithActualContent);

    const response: GenerationResponse = {
      threads,
      megaPromptUsed: megaPromptWithActualContent
    };

    return NextResponse.json(response);

  } catch (error) {
    ErrorLogger.logError(
      error instanceof Error ? error : new Error(String(error)),
      { operation: 'generation' }
    );
    
    // Check if it's an API key error
    if (error instanceof Error && error.message.includes('API key')) {
      return NextResponse.json(
        { error: 'LLM API key not configured' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to generate threads. Please try again.' },
      { status: 500 }
    );
  }
} 