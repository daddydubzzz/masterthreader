import { NextRequest, NextResponse } from 'next/server';
import { createLLMClient } from '@/lib/llm';
import { getMegaPrompt, loadMegaPromptFromFile } from '@/lib/megaPrompts';
import { getContextualExamples } from '@/lib/vectorDB';
import { GenerationRequest, GenerationResponse } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body: GenerationRequest = await request.json();
    const { script, megaPromptVersion } = body;

    // Validate input
    if (!script || !script.trim()) {
      return NextResponse.json(
        { error: 'Script is required' },
        { status: 400 }
      );
    }

    // Get the specified mega prompt version
    const megaPrompt = getMegaPrompt(megaPromptVersion);
    if (!megaPrompt) {
      return NextResponse.json(
        { error: `Mega prompt version ${megaPromptVersion} not found` },
        { status: 404 }
      );
    }

    // Load Josh's actual mega prompt content from file
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

CONTEXTUAL EXAMPLES FROM JOSH'S PAST EDITS:
${contextualExamples.map((ex, i) => `
Example ${i + 1}:
Original: "${ex.original}"
Josh's feedback: "${ex.annotation}"
Final version: "${ex.improved}"
`).join('')}

Use these examples to understand Josh's preferences and create better first-pass threads that match his style and requirements.`
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
    console.error('Generation error:', error);
    
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