import { NextRequest, NextResponse } from 'next/server';
import { 
  findSimilarTriples, 
  performRAGAnalysis,
  markTripleResolved 
} from '@/lib/vectorDB';
import { VectorTripleQuery } from '@/types';

// GET endpoint for RAG analysis
export async function GET() {
  try {
    const analysis = await performRAGAnalysis();

    return NextResponse.json({
      success: true,
      analysis
    });

  } catch (error) {
    console.error('RAG analysis error:', error);
    
    return NextResponse.json(
      { error: 'Failed to perform RAG analysis' },
      { status: 500 }
    );
  }
}

// POST endpoint for finding similar vector triples
export async function POST(request: NextRequest) {
  try {
    const body: VectorTripleQuery = await request.json();

    // Validate required fields
    if (!body.query_text || !body.query_text.trim()) {
      return NextResponse.json(
        { error: 'query_text is required' },
        { status: 400 }
      );
    }

    // Set reasonable defaults
    const query: VectorTripleQuery = {
      query_text: body.query_text.trim(),
      similarity_threshold: body.similarity_threshold || 0.8,
      limit: Math.min(body.limit || 10, 50), // Cap at 50 results
      quality_filter: body.quality_filter,
      resolved_only: body.resolved_only || false,
    };

    // Find similar vector triples
    const similarTriples = await findSimilarTriples(query);

    return NextResponse.json({
      success: true,
      similar_triples: similarTriples,
      count: similarTriples.length,
      query_used: query
    });

  } catch (error) {
    console.error('Similar triples search error:', error);
    
    // Handle specific database errors
    if (error instanceof Error) {
      if (error.message.includes('Embedding generation failed')) {
        return NextResponse.json(
          { error: 'Failed to generate query embedding. Please check OpenAI API configuration.' },
          { status: 500 }
        );
      }
      
      if (error.message.includes('Triple retrieval failed')) {
        return NextResponse.json(
          { error: 'Database query failed. Please try again.' },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Failed to find similar triples. Please try again.' },
      { status: 500 }
    );
  }
}

// PATCH endpoint for marking vector triples as resolved
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.triple_id) {
      return NextResponse.json(
        { error: 'triple_id is required' },
        { status: 400 }
      );
    }

    // Mark the triple as resolved
    const success = await markTripleResolved(body.triple_id);

    if (!success) {
      return NextResponse.json(
        { error: 'Vector triple not found or update failed' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Vector triple marked as resolved'
    });

  } catch (error) {
    console.error('Mark triple resolved error:', error);
    
    return NextResponse.json(
      { error: 'Failed to mark triple as resolved' },
      { status: 500 }
    );
  }
} 