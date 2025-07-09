import { Edit, Annotation } from '@/types';

export interface TemporalPairingOptions {
  timeWindowMs?: number;
  maxPairs?: number;
}

export interface EditAnnotationPair {
  edit: Edit;
  annotation: Annotation;
  timeDifference: number;
}

const DEFAULT_TIME_WINDOW_MS = 30000; // 30 seconds
const DEFAULT_MAX_PAIRS = 10;

/**
 * Finds pairs of edits and annotations within a time window
 * Uses a stable pairing algorithm to prevent race conditions
 */
export function findEditAnnotationPairs(
  edits: Edit[],
  annotations: Annotation[],
  options: TemporalPairingOptions = {}
): EditAnnotationPair[] {
  const { 
    timeWindowMs = DEFAULT_TIME_WINDOW_MS, 
    maxPairs = DEFAULT_MAX_PAIRS 
  } = options;

  // Sort by timestamp for stable pairing
  const sortedEdits = [...edits].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  const sortedAnnotations = [...annotations].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

  const pairs: EditAnnotationPair[] = [];
  const usedEditIds = new Set<string>();
  const usedAnnotationIds = new Set<string>();

  // For each edit, find the closest annotation within the time window
  for (const edit of sortedEdits) {
    if (usedEditIds.has(edit.id) || pairs.length >= maxPairs) continue;

    let bestMatch: { annotation: Annotation; timeDifference: number } | null = null;

    for (const annotation of sortedAnnotations) {
      if (usedAnnotationIds.has(annotation.id)) continue;

      const timeDifference = Math.abs(
        annotation.timestamp.getTime() - edit.timestamp.getTime()
      );

      // Skip if outside time window
      if (timeDifference > timeWindowMs) continue;

      // Update best match if this is closer
      if (!bestMatch || timeDifference < bestMatch.timeDifference) {
        bestMatch = { annotation, timeDifference };
      }
    }

    // If we found a match, add it to pairs
    if (bestMatch) {
      pairs.push({
        edit,
        annotation: bestMatch.annotation,
        timeDifference: bestMatch.timeDifference
      });
      
      usedEditIds.add(edit.id);
      usedAnnotationIds.add(bestMatch.annotation.id);
    }
  }

  return pairs;
}

/**
 * Finds the most recent edit that can be paired with an annotation
 * Used for real-time pairing when adding annotations
 */
export function findRecentEditForAnnotation(
  annotation: Annotation,
  edits: Edit[],
  timeWindowMs: number = DEFAULT_TIME_WINDOW_MS
): Edit | null {
  const annotationTime = annotation.timestamp.getTime();
  
  // Find edits within the time window
  const candidateEdits = edits.filter(edit => {
    const timeDifference = Math.abs(edit.timestamp.getTime() - annotationTime);
    return timeDifference <= timeWindowMs;
  });

  // Return the most recent edit (closest to annotation time)
  if (candidateEdits.length === 0) return null;

  return candidateEdits.reduce((closest, current) => {
    const closestDiff = Math.abs(closest.timestamp.getTime() - annotationTime);
    const currentDiff = Math.abs(current.timestamp.getTime() - annotationTime);
    return currentDiff < closestDiff ? current : closest;
  });
}

/**
 * Checks if an edit and annotation can be paired based on timing
 */
export function canPairEditWithAnnotation(
  edit: Edit,
  annotation: Annotation,
  timeWindowMs: number = DEFAULT_TIME_WINDOW_MS
): boolean {
  const timeDifference = Math.abs(
    annotation.timestamp.getTime() - edit.timestamp.getTime()
  );
  return timeDifference <= timeWindowMs;
}

/**
 * Creates a vector triple capture payload from an edit-annotation pair
 */
export function createVectorTripleFromPair(
  pair: EditAnnotationPair,
  scriptTitle?: string,
  positionInThread?: number
): {
  original_tweet: string;
  annotation: string;
  final_edit: string;
  script_title?: string;
  position_in_thread?: number;
  quality_rating: number;
  resolved: boolean;
} {
  return {
    original_tweet: pair.edit.originalText,
    annotation: pair.annotation.text,
    final_edit: pair.edit.editedText,
    script_title: scriptTitle,
    position_in_thread: positionInThread,
    quality_rating: 3, // Default rating
    resolved: false,
  };
} 