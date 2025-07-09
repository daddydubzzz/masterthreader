import { NextRequest, NextResponse } from 'next/server';
import { captureVectorTriple } from '@/lib/vectorDB';
import { VectorTriple } from '@/types';
import { ValidationError, validateRequired, validateStringLength, validatePositiveNumber, ErrorLogger } from '@/lib/errorHandling';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields and constraints with comprehensive validation
    try {
      validateRequired(body.original_tweet, 'original_tweet');
      validateRequired(body.annotation, 'annotation');
      validateRequired(body.final_edit, 'final_edit');
      
      validateStringLength(body.original_tweet, 'original_tweet', 5000);
      validateStringLength(body.annotation, 'annotation', 5000);
      validateStringLength(body.final_edit, 'final_edit', 5000);
      
      if (body.quality_rating !== undefined) {
        if (typeof body.quality_rating !== 'number' || body.quality_rating < 1 || body.quality_rating > 5) {
          throw new ValidationError('quality_rating must be a number between 1 and 5');
        }
      }
      
      if (body.position_in_thread !== undefined) {
        if (typeof body.position_in_thread !== 'number' || body.position_in_thread < 0) {
          throw new ValidationError('position_in_thread must be a non-negative number');
        }
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

    // Create vector triple from request body
    const triple: VectorTriple = {
      original_tweet: body.original_tweet.trim(),
      annotation: body.annotation.trim(),
      final_edit: body.final_edit.trim(),
      script_title: body.script_title?.trim(),
      position_in_thread: body.position_in_thread,
      quality_rating: body.quality_rating || 3, // Default to medium quality
      resolved: body.resolved || false,
    };

    // Store the vector triple in RAG database
    const tripleId = await captureVectorTriple(triple);

    return NextResponse.json({
      success: true,
      triple_id: tripleId,
      message: 'Vector triple captured successfully'
    });

  } catch (error) {
    ErrorLogger.logError(
      error instanceof Error ? error : new Error(String(error)),
      { operation: 'capture-edit' }
    );
    
    // Handle specific database errors
    if (error instanceof Error) {
      if (error.message.includes('Embedding generation failed')) {
        return NextResponse.json(
          { error: 'Failed to generate text embedding. Please check OpenAI API configuration.' },
          { status: 500 }
        );
      }
      
      if (error.message.includes('Vector triple storage failed')) {
        return NextResponse.json(
          { error: 'Database storage failed. Please try again.' },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Failed to capture vector triple. Please try again.' },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve vector triples (for debugging/analysis)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const scriptTitle = searchParams.get('script_title');
    const limit = parseInt(searchParams.get('limit') || '10');

    if (scriptTitle) {
      // Get triples for specific script
      const { getBestExamples } = await import('@/lib/vectorDB');
      const triples = await getBestExamples(limit);
      
      // Filter by script title if needed
      const filteredTriples = triples.filter(triple => 
        !scriptTitle || triple.script_title === scriptTitle
      );
      
      return NextResponse.json({
        success: true,
        triples: filteredTriples,
        count: filteredTriples.length
      });
    } else {
      // Get recent high-quality triples
      const { getBestExamples } = await import('@/lib/vectorDB');
      const triples = await getBestExamples(limit);
      
      return NextResponse.json({
        success: true,
        triples,
        count: triples.length
      });
    }

  } catch (error) {
    ErrorLogger.logError(
      error instanceof Error ? error : new Error(String(error)),
      { operation: 'get-vector-triples' }
    );
    
    return NextResponse.json(
      { error: 'Failed to retrieve vector triples' },
      { status: 500 }
    );
  }
} 