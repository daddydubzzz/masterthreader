import { useCallback, useMemo } from 'react';
import { Thread, Edit, Annotation } from '@/types';
import { findRecentEditForAnnotation, createVectorTripleFromPair } from '@/lib/temporalPairing';

interface UseThreadDisplayReturn {
  hasEditsOrAnnotations: boolean;
  updateThread: (threadIndex: number, updatedThread: Thread) => void;
  editTweet: (threadIndex: number, tweetIndex: number, originalContent: string, newContent: string) => void;
  addAnnotation: (threadIndex: number, annotation: string, type: Annotation['type']) => void;
}

// Helper function to capture vector triples in RAG database
async function captureVectorTripleInDB(
  originalTweet: string,
  annotation: string,
  finalEdit: string,
  scriptTitle?: string,
  positionInThread?: number
): Promise<void> {
  try {
    await fetch('/api/capture-edit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        original_tweet: originalTweet,
        annotation: annotation,
        final_edit: finalEdit,
        script_title: scriptTitle,
        position_in_thread: positionInThread,
        quality_rating: 3, // Default rating
        resolved: false,
      }),
    });
  } catch (error) {
    // Don't block the UI if vector DB capture fails
    console.warn('Failed to capture vector triple:', error);
  }
}

export function useThreadDisplay(
  threads: Thread[],
  onThreadsUpdated: (threads: Thread[]) => void,
  scriptTitle?: string // Optional script context for better vector DB organization
): UseThreadDisplayReturn {
  
  // Check if there are any edits or annotations across all threads
  const hasEditsOrAnnotations = useMemo(() => {
    return threads.some(thread => 
      thread.edits.length > 0 || thread.annotations.length > 0
    );
  }, [threads]);

  // Update a specific thread
  const updateThread = useCallback((threadIndex: number, updatedThread: Thread) => {
    const newThreads = [...threads];
    newThreads[threadIndex] = updatedThread;
    onThreadsUpdated(newThreads);
  }, [threads, onThreadsUpdated]);

  // Edit a specific tweet within a thread
  const editTweet = useCallback((
    threadIndex: number, 
    tweetIndex: number, 
    originalContent: string, 
    newContent: string
  ) => {
    if (originalContent === newContent) return;

    const thread = threads[threadIndex];
    const editId = `edit-${Date.now()}-${Math.random()}`;
    
    const newEdit: Edit = {
      id: editId,
      originalText: originalContent,
      editedText: newContent,
      timestamp: new Date()
    };

    // Update the thread content with the edit
    const tweetLines = thread.content.split('\n');
    tweetLines[tweetIndex] = newContent;
    
    const updatedThread: Thread = {
      ...thread,
      content: tweetLines.join('\n'),
      edits: [...thread.edits, newEdit]
    };

    updateThread(threadIndex, updatedThread);

    // Note: We'll capture the complete vector triple when annotation is added
    // For now, just store the edit for potential later pairing
  }, [threads, updateThread]);

  // Add annotation to a thread
  const addAnnotation = useCallback((
    threadIndex: number, 
    annotation: string, 
    type: Annotation['type']
  ) => {
    const thread = threads[threadIndex];
    const annotationId = `annotation-${Date.now()}-${Math.random()}`;
    
    const newAnnotation: Annotation = {
      id: annotationId,
      text: annotation,
      type,
      timestamp: new Date()
    };

    const updatedThread: Thread = {
      ...thread,
      annotations: [...thread.annotations, newAnnotation]
    };

    updateThread(threadIndex, updatedThread);

    // Use robust temporal pairing to find matching edit
    const recentEdit = findRecentEditForAnnotation(newAnnotation, thread.edits);

    if (recentEdit) {
      // Create vector triple from the paired edit and annotation
      const vectorTriple = createVectorTripleFromPair(
        {
          edit: recentEdit,
          annotation: newAnnotation,
          timeDifference: Math.abs(newAnnotation.timestamp.getTime() - recentEdit.timestamp.getTime())
        },
        scriptTitle,
        threadIndex // Use thread index as rough position
      );

      // Capture the complete vector triple: original → annotation → final_edit
      captureVectorTripleInDB(
        vectorTriple.original_tweet,
        vectorTriple.annotation,
        vectorTriple.final_edit,
        vectorTriple.script_title,
        vectorTriple.position_in_thread
      );
    }
  }, [threads, updateThread, scriptTitle]);

  return {
    hasEditsOrAnnotations,
    updateThread,
    editTweet,
    addAnnotation
  };
} 