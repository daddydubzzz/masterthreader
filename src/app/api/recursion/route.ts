import { NextRequest, NextResponse } from 'next/server';
import { createLLMClient } from '@/lib/llm';
import { getContextualExamples, findSimilarTriples, captureVectorTriple } from '@/lib/vectorDB';
import { RecursionPayload } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const payload: RecursionPayload = await request.json();
    const { originalScript, threads } = payload;

    // Validate input
    if (!originalScript || !originalScript.trim()) {
      return NextResponse.json(
        { error: 'Original script is required' },
        { status: 400 }
      );
    }

    if (!threads || threads.length === 0) {
      return NextResponse.json(
        { error: 'Threads are required' },
        { status: 400 }
      );
    }

    // Check if there are any edits or annotations to learn from
    const hasEditsFeedback = threads.some(thread => 
      thread.edits.length > 0 || thread.annotations.length > 0
    );

    if (!hasEditsFeedback) {
      return NextResponse.json(
        { error: 'No edits or annotations found to learn from' },
        { status: 400 }
      );
    }

    // Extract script title from the first few words for context
    const scriptTitle = originalScript.trim().split(' ').slice(0, 5).join(' ');

    // Collect all edits and annotations for RAG contextualization
    const allEdits = threads.flatMap(thread => thread.edits);
    const allAnnotations = threads.flatMap(thread => thread.annotations);

    // Get contextual examples from RAG system for better recursion
    // TODO: Use contextual examples to enhance recursion prompts
    try {
      await getContextualExamples(originalScript, 5);
      // Will be used in enhanced recursion implementation
    } catch (error) {
      console.warn('Failed to get contextual examples for recursion:', error);
    }

    // Find similar patterns for each edit to provide context
    // TODO: Use this pattern analysis to enhance recursion prompts
    await Promise.all(
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

    // Get comprehensive pattern analysis (for future enhancement)
    // let recurringIssues: Array<{
    //   original_text: string;
    //   frequency: number;
    //   latest_edit: string;
    //   suggestions: string[];
    // }> = [];

    // try {
    //   const analysis = await analyzeEditingPatterns();
    //   recurringIssues = analysis.recurring_issues;
    // } catch (error) {
    //   console.warn('Failed to get pattern analysis:', error);
    // }

    // Build enriched context for LLM (for future enhanced recursion implementation)
    // const editsAndAnnotations = threads
    //   .map(thread => {
    //     const edits = thread.edits.map(edit => 
    //       `Edit: "${edit.originalText}" → "${edit.editedText}"`
    //     ).join('\n');
    //     
    //     const annotations = thread.annotations.map(annotation =>
    //       `${annotation.type.toUpperCase()}: ${annotation.text}`
    //     ).join('\n');
    //     
    //     return `Thread ${thread.id}:\n${edits}\n${annotations}`;
    //   })
    //   .join('\n\n');

    // Build pattern context from similar examples (for future enhancement)
    // const patternContext = patternAnalysis
    //   .filter(item => item.similarPatterns.length > 0)
    //   .map(item => {
    //     const patterns = item.similarPatterns
    //       .map(sp => `  Similar: "${sp.pattern.original_text}" → "${sp.pattern.edit_text}" (${sp.pattern.annotation_text || 'no annotation'})`)
    //       .join('\n');
    //     
    //     return `Edit: "${item.edit.originalText}" → "${item.edit.editedText}"\nSimilar patterns from Josh's history:\n${patterns}`;
    //   })
    //   .join('\n\n');

    // Build recurring issues context (for future enhancement)
    // const recurringContext = recurringIssues.length > 0 
    //   ? `\n\nRECURRING ISSUES JOSH FREQUENTLY FIXES:\n${
    //       recurringIssues.slice(0, 5).map(issue => 
    //         `- "${issue.original_text}" (appears ${issue.frequency}x) → suggests: ${issue.suggestions.join(', ')}`
    //       ).join('\n')
    //     }`
    //   : '';

    // TODO: Implement enhanced recursion that uses the pattern analysis data
    // For now, we collect and store the patterns but use the standard LLM interface
    // Future enhancement: Pass pattern context to a custom recursion prompt

    // Perform enhanced recursion using pluggable LLM backend
    const llmClient = createLLMClient();
    const response = await llmClient.performRecursion({
      originalScript,
      threads,
      megaPromptVersion: payload.megaPromptVersion
    });

    // Store vector triples from recursion session for future learning
    try {
      // Capture each edit with paired annotation as complete vector triple
      const capturePromises = allEdits.map((edit, index) => {
        const pairedAnnotation = allAnnotations.find(ann => 
          Math.abs(ann.timestamp.getTime() - edit.timestamp.getTime()) < 30000 // within 30 seconds
        );

        // Only capture if we have annotation (complete vector triple)
        if (pairedAnnotation) {
          return captureVectorTriple({
            original_tweet: edit.originalText,
            annotation: pairedAnnotation.text,
            final_edit: edit.editedText,
            script_title: scriptTitle,
            position_in_thread: Math.floor(index / threads.length),
            quality_rating: 4, // Higher rating for recursion session edits
            resolved: false,
          });
        }
        return Promise.resolve();
      }).filter(Boolean); // Remove empty promises

      await Promise.all(capturePromises);
    } catch (error) {
      // Don't fail the recursion if vector triple capture fails
      console.warn('Failed to capture vector triples from recursion:', error);
    }

    return NextResponse.json(response);

  } catch (error) {
    console.error('Recursion error:', error);
    
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