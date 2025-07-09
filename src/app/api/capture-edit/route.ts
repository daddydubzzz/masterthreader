import { NextRequest, NextResponse } from 'next/server';
import { captureVectorTriple } from '@/lib/vectorDB';
import { VectorTriple } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields for vector triple
    if (!body.original_tweet || !body.annotation || !body.final_edit) {
      return NextResponse.json(
        { error: 'original_tweet, annotation, and final_edit are required' },
        { status: 400 }
      );
    }

    // Validate text lengths (reasonable limits)
    if (body.original_tweet.length > 5000 || 
        body.annotation.length > 5000 || 
        body.final_edit.length > 5000) {
      return NextResponse.json(
        { error: 'Text length exceeds maximum limit (5000 characters)' },
        { status: 400 }
      );
    }

    // Validate quality rating if provided
    if (body.quality_rating && (body.quality_rating < 1 || body.quality_rating > 5)) {
      return NextResponse.json(
        { error: 'quality_rating must be between 1 and 5' },
        { status: 400 }
      );
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
    console.error('Capture vector triple error:', error);
    
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
    console.error('Get vector triples error:', error);
    
    return NextResponse.json(
      { error: 'Failed to retrieve vector triples' },
      { status: 500 }
    );
  }
} 