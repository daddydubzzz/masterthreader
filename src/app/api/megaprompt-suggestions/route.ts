import { NextRequest, NextResponse } from 'next/server';
import { 
  generateMegaPromptSuggestions,
  type MegaPromptSuggestion
} from '@/lib/megaPromptVersioning';
import { 
  applyMegaPromptChanges, 
  createMegaPromptVersion,
  getAllVersions,
  rollbackToVersion
} from '@/lib/megaPromptVersioningServer';
import { getRecurringPatterns } from '@/lib/vectorDB';
import { ValidationError, ErrorLogger } from '@/lib/errorHandling';

// In-memory storage for suggestions (in production, use database)
const pendingSuggestions: Map<string, MegaPromptSuggestion> = new Map();

// GET - Get all pending suggestions and version history
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'versions') {
      // Return version history
      const versions = getAllVersions();
      return NextResponse.json({ versions });
    }

    if (action === 'generate') {
      // Generate new suggestions based on current patterns
      try {
        const patterns = await getRecurringPatterns(10);
        
        // Transform patterns into format expected by suggestion generator
        const formattedPatterns = patterns.map(p => ({
          original: p.original_tweet,
          annotation: p.common_annotations?.[0] || 'Improve this pattern',
          final: p.best_example?.final_edit || p.original_tweet,
          frequency: p.frequency
        }));

        // Generate recurring issues analysis
        const recurringIssues = patterns
          .filter(p => p.frequency >= 2)
          .map(p => ({
            pattern: p.original_tweet,
            frequency: p.frequency,
            suggestions: p.common_annotations || ['Improve clarity', 'Add specificity']
          }));

        const suggestions = generateMegaPromptSuggestions(formattedPatterns, recurringIssues);
        
        // Store suggestions in memory
        suggestions.forEach(suggestion => {
          pendingSuggestions.set(suggestion.id, suggestion);
        });

        return NextResponse.json({ 
          suggestions,
          generated: suggestions.length,
          basedOnPatterns: patterns.length
        });

      } catch (error) {
        console.error('Error generating suggestions:', error);
        return NextResponse.json({ 
          suggestions: [],
          generated: 0,
          basedOnPatterns: 0,
          error: 'Failed to generate suggestions'
        });
      }
    }

    // Default: return pending suggestions
    const suggestions = Array.from(pendingSuggestions.values())
      .filter(s => s.status === 'pending')
      .sort((a, b) => b.confidence - a.confidence);

    return NextResponse.json({ suggestions });

  } catch (error) {
    ErrorLogger.logError(
      error instanceof Error ? error : new Error(String(error)),
      { operation: 'get-megaprompt-suggestions' }
    );

    return NextResponse.json(
      { error: 'Failed to retrieve suggestions' },
      { status: 500 }
    );
  }
}

// POST - Accept or reject suggestions, create versions, rollback
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, suggestionId, versionId, description } = body;

    // Validate input
    if (!action) {
      throw new ValidationError('Action is required');
    }

    switch (action) {
      case 'accept':
        if (!suggestionId) {
          throw new ValidationError('Suggestion ID is required');
        }

        const suggestion = pendingSuggestions.get(suggestionId);
        if (!suggestion) {
          return NextResponse.json(
            { error: 'Suggestion not found' },
            { status: 404 }
          );
        }

        // Apply the changes to megaprompt files
        applyMegaPromptChanges(suggestion.changes);

        // Create new version
        const newVersion = createMegaPromptVersion(
          suggestion.changes,
          description || `Applied suggestion: ${suggestion.reasoning}`,
          'user'
        );

        // Mark suggestion as accepted
        suggestion.status = 'accepted';
        pendingSuggestions.set(suggestionId, suggestion);

        return NextResponse.json({
          success: true,
          version: newVersion,
          message: 'Suggestion accepted and applied'
        });

      case 'reject':
        if (!suggestionId) {
          throw new ValidationError('Suggestion ID is required');
        }

        const rejectedSuggestion = pendingSuggestions.get(suggestionId);
        if (!rejectedSuggestion) {
          return NextResponse.json(
            { error: 'Suggestion not found' },
            { status: 404 }
          );
        }

        // Mark suggestion as rejected
        rejectedSuggestion.status = 'rejected';
        pendingSuggestions.set(suggestionId, rejectedSuggestion);

        return NextResponse.json({
          success: true,
          message: 'Suggestion rejected'
        });

      case 'rollback':
        if (!versionId) {
          throw new ValidationError('Version ID is required');
        }

        rollbackToVersion(versionId);

        return NextResponse.json({
          success: true,
          message: 'Successfully rolled back to selected version'
        });

      case 'manual-change':
        const { changes, changeDescription } = body;
        
        if (!changes || !Array.isArray(changes)) {
          throw new ValidationError('Changes array is required');
        }

        // Apply manual changes
        applyMegaPromptChanges(changes);

        // Create version for manual changes
        const manualVersion = createMegaPromptVersion(
          changes,
          changeDescription || 'Manual megaprompt changes',
          'user'
        );

        return NextResponse.json({
          success: true,
          version: manualVersion,
          message: 'Manual changes applied successfully'
        });

      default:
        throw new ValidationError(`Unknown action: ${action}`);
    }

  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    ErrorLogger.logError(
      error instanceof Error ? error : new Error(String(error)),
      { operation: 'post-megaprompt-suggestions' }
    );

    return NextResponse.json(
      { error: 'Failed to process suggestion action' },
      { status: 500 }
    );
  }
}

// DELETE - Clear all suggestions or specific suggestion
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const suggestionId = searchParams.get('id');

    if (suggestionId) {
      // Delete specific suggestion
      if (pendingSuggestions.has(suggestionId)) {
        pendingSuggestions.delete(suggestionId);
        return NextResponse.json({ 
          success: true, 
          message: 'Suggestion deleted' 
        });
      } else {
        return NextResponse.json(
          { error: 'Suggestion not found' },
          { status: 404 }
        );
      }
    } else {
      // Clear all suggestions
      pendingSuggestions.clear();
      return NextResponse.json({ 
        success: true, 
        message: 'All suggestions cleared' 
      });
    }

  } catch (error) {
    ErrorLogger.logError(
      error instanceof Error ? error : new Error(String(error)),
      { operation: 'delete-megaprompt-suggestions' }
    );

    return NextResponse.json(
      { error: 'Failed to delete suggestions' },
      { status: 500 }
    );
  }
} 