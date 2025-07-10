import { NextRequest, NextResponse } from 'next/server';
import { createLLMClient } from '@/lib/llm';
import { getContextualExamples, findSimilarTriples, captureVectorTriple } from '@/lib/vectorDB';
import { RecursionPayload } from '@/types';
import { findEditAnnotationPairs, createVectorTripleFromPair } from '@/lib/temporalPairing';
import { ValidationError, ErrorLogger } from '@/lib/errorHandling';

export async function POST(request: NextRequest) {
  try {
    const payload: RecursionPayload = await request.json();
    const { originalScript, threads } = payload;

    // Validate input using standardized validation
    try {
      if (!originalScript || !originalScript.trim()) {
        throw new ValidationError('Original script is required');
      }

      if (!threads || threads.length === 0) {
        throw new ValidationError('Threads are required');
      }

      // Check if there are any edits or annotations to learn from
      const hasEditsFeedback = threads.some(thread => 
        thread.edits.length > 0 || thread.annotations.length > 0
      );

      if (!hasEditsFeedback) {
        throw new ValidationError('No edits or annotations found to learn from');
      }
    } catch (error) {
      if (error instanceof ValidationError) {
        return NextResponse.json(
          { error: error.message },
          { status: 400 }
        );
      }
      throw error;
    }

    // Extract script title from the first few words for context
    const scriptTitle = originalScript.trim().split(' ').slice(0, 5).join(' ');

    // Collect all edits and annotations for RAG contextualization
    const allEdits = threads.flatMap(thread => thread.edits);
    const allAnnotations = threads.flatMap(thread => thread.annotations);

    // Get contextual examples from RAG system for better recursion
    let contextualExamples: Array<{
      original: string;
      annotation: string;
      improved: string;
    }> = [];
    try {
      const examples = await getContextualExamples(originalScript, 5);
      contextualExamples = examples.map(example => ({
        original: example.original_tweet,
        annotation: example.annotation,
        improved: example.final_edit
      }));
    } catch (error) {
      console.warn('Failed to get contextual examples for recursion:', error);
    }

    // Find similar patterns for each edit to provide context
    const patternAnalysis = await Promise.all(
      allEdits.slice(0, 3).map(async (edit) => { // Limit to first 3 edits for performance
        try {
          const similarTriples = await findSimilarTriples({
            query_text: `${edit.originalText} ${edit.editedText}`,
            similarity_threshold: 0.7,
            limit: 3,
            quality_filter: 4, // Only high-quality examples
          });
          
          return {
            edit,
            similarExamples: similarTriples.map(st => st.triple),
          };
        } catch (error) {
          console.warn('Failed to find similar patterns for edit:', edit.id, error);
          return { edit, similarExamples: [] };
        }
      })
    );

    // Get comprehensive pattern analysis from RAG system
    let recurringIssues: Array<{
      original_tweet: string;
      frequency: number;
      best_example: unknown;
      common_annotations: string[];
    }> = [];

    try {
      const { getRecurringPatterns } = await import('@/lib/vectorDB');
      recurringIssues = await getRecurringPatterns(5);
    } catch (error) {
      console.warn('Failed to get recurring patterns:', error);
    }

    // Build enriched context for LLM enhanced recursion implementation
    const editsAndAnnotations = threads
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

    // Build pattern context from similar examples
    const patternContext = patternAnalysis
      .filter(item => item.similarExamples.length > 0)
      .map(item => {
        const patterns = item.similarExamples
          .map(example => `  Similar: "${example.original_tweet}" → "${example.final_edit}" (${example.annotation || 'no annotation'})`)
          .join('\n');
        
        return `Edit: "${item.edit.originalText}" → "${item.edit.editedText}"\nSimilar patterns from history:\n${patterns}`;
      })
      .join('\n\n');

    // Build recurring issues context
    const recurringContext = recurringIssues.length > 0 
      ? `\n\nRECURRING ISSUES FREQUENTLY EDITED:\n${
          recurringIssues.slice(0, 5).map(issue => 
            `- "${issue.original_tweet}" (appears ${issue.frequency}x) → common annotations: ${issue.common_annotations.slice(0, 2).join(', ')}`
          ).join('\n')
        }`
      : '';

    // Perform enhanced recursion using pluggable LLM backend with RAG context
    const llmClient = createLLMClient();
    
    // Create enhanced recursion payload with RAG context
    const enhancedPayload = {
      originalScript,
      threads,
      megaPromptVersion: payload.megaPromptVersion,
      ragContext: {
        contextualExamples,
        patternContext,
        recurringContext,
        editsAndAnnotations
      }
    };
    
    const response = await llmClient.performRecursion(enhancedPayload);

    // Store vector triples from recursion session for future learning
    try {
      // Use robust temporal pairing to find edit-annotation pairs
      const editAnnotationPairs = findEditAnnotationPairs(allEdits, allAnnotations, {
        timeWindowMs: 30000, // 30 seconds
        maxPairs: 20 // Reasonable limit for recursion session
      });

      // Capture each paired edit-annotation as complete vector triple
      const capturePromises = editAnnotationPairs.map((pair, index) => {
        const vectorTriple = createVectorTripleFromPair(
          pair,
          scriptTitle,
          Math.floor(index / threads.length)
        );

        return captureVectorTriple({
          ...vectorTriple,
          quality_rating: 4, // Higher rating for recursion session edits
        });
      });

      await Promise.all(capturePromises);
    } catch (error) {
      // Don't fail the recursion if vector triple capture fails
      console.warn('Failed to capture vector triples from recursion:', error);
    }

    return NextResponse.json(response);

  } catch (error) {
    ErrorLogger.logError(
      error instanceof Error ? error : new Error(String(error)),
      { operation: 'recursion' }
    );
    
    // Check if it's an API key error
    if (error instanceof Error && error.message.includes('API key')) {
      return NextResponse.json(
        { error: 'LLM API key not configured' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to perform recursion. Please try again.' },
      { status: 500 }
    );
  }
} 