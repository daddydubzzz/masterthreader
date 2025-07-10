import { useState, useCallback, useEffect } from 'react';
import { Thread } from '@/types';
import { UseRightPanelReturn, EditCapture, LearningPattern, MegaPromptSuggestion, TrainingSession } from '../types';
import { findEditAnnotationPairs, createVectorTripleFromPair } from '@/lib/temporalPairing';
import { showNotification } from '@/utils/notifications';
import { 
  MegaPromptSuggestion as VersioningSuggestion, 
  MegaPromptVersion,
  initializeMegaPromptVersioning 
} from '@/lib/megaPromptVersioning';

export function useRightPanel(
  threads?: Thread[],
  originalScript?: string
): UseRightPanelReturn {
  // State management
  const [editCaptures, setEditCaptures] = useState<EditCapture[]>([]);
  const [learningPatterns, setLearningPatterns] = useState<LearningPattern[]>([]);
  const [suggestions, setSuggestions] = useState<MegaPromptSuggestion[]>([]);
  const [megaPromptSuggestions, setMegaPromptSuggestions] = useState<VersioningSuggestion[]>([]);
  const [versionHistory, setVersionHistory] = useState<MegaPromptVersion[]>([]);
  const [currentSession, setCurrentSession] = useState<TrainingSession | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Extract real edits and annotations from threads
  useEffect(() => {
    if (threads && threads.length > 0) {
      const captures: EditCapture[] = [];
      
      threads.forEach((thread, threadIndex) => {
        // Capture edits
        thread.edits.forEach((edit, editIndex) => {
          captures.push({
            id: edit.id,
            timestamp: edit.timestamp,
            threadId: thread.id,
            originalText: edit.originalText,
            editedText: edit.editedText,
            editType: 'inline',
            context: `Thread ${threadIndex + 1} - Edit ${editIndex + 1}`,
            userComment: undefined
          });
        });

        // Capture annotations
        thread.annotations.forEach((annotation) => {
          captures.push({
            id: annotation.id,
            timestamp: annotation.timestamp,
            threadId: thread.id,
            originalText: '', // Annotations don't have original text
            editedText: annotation.text,
            editType: 'annotation',
            context: `Thread ${threadIndex + 1} - ${annotation.type} annotation`,
            userComment: annotation.text
          });
        });
      });

      setEditCaptures(captures);
    }
  }, [threads]);

  // Analyze patterns from RAG database
  const analyzePatterns = useCallback(async () => {
    if (!threads || threads.length === 0) return;

    setIsProcessing(true);
    try {
      // Get RAG analysis for learning patterns
      const response = await fetch('/api/analyze-patterns', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.analysis) {
          // Convert RAG analysis to learning patterns
          const patterns: LearningPattern[] = [];
          
          // Process recurring patterns
          if (data.analysis.recurring_patterns) {
            data.analysis.recurring_patterns.forEach((pattern: {
              original_text: string;
              latest_edit: string;
              frequency: number;
            }, index: number) => {
              patterns.push({
                id: `pattern-recurring-${index}`,
                patternType: 'style',
                description: `Recurring edit: "${pattern.original_text}" → "${pattern.latest_edit}"`,
                examples: [pattern.original_text, pattern.latest_edit],
                confidence: Math.min(pattern.frequency / 10, 1), // Normalize frequency to confidence
                frequency: pattern.frequency,
                lastSeen: new Date()
              });
            });
          }

          // Process best examples
          if (data.analysis.best_examples) {
            data.analysis.best_examples.slice(0, 3).forEach((example: {
              original_tweet: string;
              final_edit: string;
              annotation: string;
              quality_rating: number;
              created_at: string;
            }, index: number) => {
              patterns.push({
                id: `pattern-best-${index}`,
                patternType: 'engagement',
                description: `High-quality example: ${example.annotation}`,
                examples: [example.original_tweet, example.final_edit],
                confidence: example.quality_rating / 5, // Convert 1-5 rating to 0-1 confidence
                frequency: 1,
                lastSeen: new Date(example.created_at)
              });
            });
          }

          setLearningPatterns(patterns);
        }
      } else {
        console.warn('Failed to analyze patterns:', response.status);
      }
    } catch (error) {
      console.error('Error analyzing patterns:', error);
      
      // Show user-friendly error message
      showNotification('Failed to analyze patterns. Please try again.', 'error', 5000);
    } finally {
      setIsProcessing(false);
    }
  }, [threads]);

  // Generate suggestions based on edit patterns
  const generateSuggestions = useCallback(async () => {
    if (!threads || editCaptures.length === 0) return;

    setIsProcessing(true);
    try {
      // Analyze edit patterns to generate suggestions
      const editPatterns = editCaptures.filter(capture => capture.editType === 'inline');
      const annotationPatterns = editCaptures.filter(capture => capture.editType === 'annotation');

      const newSuggestions: MegaPromptSuggestion[] = [];

      // Generate suggestions based on frequent edit patterns
      if (editPatterns.length >= 2) {
        newSuggestions.push({
          id: `suggestion-${Date.now()}-1`,
          type: 'addition',
          category: 'style',
          suggestedRule: 'Based on your edits, consider adding more direct language and shorter sentences',
          reasoning: `Detected ${editPatterns.length} edits that consistently shortened and simplified language`,
          basedOnEdits: editPatterns.map(e => e.id),
          confidence: Math.min(editPatterns.length / 5, 1),
          priority: editPatterns.length >= 3 ? 'high' : 'medium'
        });
      }

      // Generate suggestions based on annotation patterns
      if (annotationPatterns.length >= 1) {
        const improvementAnnotations = annotationPatterns.filter(a => a.context.includes('improvement'));
        if (improvementAnnotations.length > 0) {
          newSuggestions.push({
            id: `suggestion-${Date.now()}-2`,
            type: 'modification',
            category: 'core',
            currentRule: 'Create engaging Twitter threads',
            suggestedRule: 'Focus on improvement-based feedback patterns you\'ve identified',
            reasoning: `Your improvement annotations suggest focusing on ${improvementAnnotations[0].userComment?.slice(0, 50)}...`,
            basedOnEdits: improvementAnnotations.map(a => a.id),
            confidence: 0.8,
            priority: 'high'
          });
        }
      }

      setSuggestions(newSuggestions);
    } catch (error) {
      console.error('Error generating suggestions:', error);
    } finally {
      setIsProcessing(false);
    }
  }, [threads, editCaptures]);

  // Event handlers
  const captureEdit = useCallback((edit: Omit<EditCapture, 'id' | 'timestamp'>) => {
    const newEdit: EditCapture = {
      ...edit,
      id: `edit-${Date.now()}`,
      timestamp: new Date()
    };
    setEditCaptures(prev => [newEdit, ...prev].slice(0, 50)); // Keep last 50 edits
  }, []);

  const processThreadAnnotations = useCallback(async (threadsToProcess: Thread[]) => {
    setIsProcessing(true);
    try {
      // Process each thread using robust temporal pairing
      for (const thread of threadsToProcess) {
        const editAnnotationPairs = findEditAnnotationPairs(
          thread.edits,
          thread.annotations,
          { timeWindowMs: 30000, maxPairs: 10 }
        );

        // Capture each paired edit-annotation as complete vector triple
        for (const pair of editAnnotationPairs) {
          const vectorTriple = createVectorTripleFromPair(
            pair,
            originalScript ? originalScript.slice(0, 50) : undefined,
            0 // Use 0 as default position for now
          );

          // Capture complete vector triple in RAG database
          await fetch('/api/capture-edit', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              ...vectorTriple,
              quality_rating: 4, // High quality from manual annotation
            }),
          });
        }
      }
      
      // After processing, analyze patterns
      await analyzePatterns();
    } catch (error) {
      console.error('Error processing thread annotations:', error);
    } finally {
      setIsProcessing(false);
    }
  }, [originalScript, analyzePatterns]);

  const applyPattern = useCallback((patternId: string) => {
    console.log('Applying pattern:', patternId);
    // Implementation for applying a learned pattern
  }, []);

  const acceptSuggestion = useCallback(async (suggestionId: string) => {
    const suggestion = suggestions.find(s => s.id === suggestionId);
    if (!suggestion) return;

    try {
      // Here we would typically save the accepted suggestion to the megaprompt
      // For now, we'll just log it and remove from suggestions
      console.log('Accepted suggestion:', suggestion);
      
      // TODO: Integrate with megaprompt update system
      // await updateMegaPrompt(suggestion);
      
      setSuggestions(prev => prev.filter(s => s.id !== suggestionId));
      showNotification('Suggestion accepted successfully!', 'success');
    } catch (error) {
      console.error('Error accepting suggestion:', error);
      showNotification('Failed to accept suggestion. Please try again.', 'error');
    }
  }, [suggestions]);

  const rejectSuggestion = useCallback((suggestionId: string) => {
    setSuggestions(prev => prev.filter(s => s.id !== suggestionId));
    console.log('Rejected suggestion:', suggestionId);
  }, []);

  const startTrainingSession = useCallback(() => {
    const newSession: TrainingSession = {
      id: `session-${Date.now()}`,
      startTime: new Date(),
      editsCount: editCaptures.length,
      patternsIdentified: learningPatterns.length,
      suggestionsGenerated: suggestions.length,
      scriptsProcessed: originalScript ? [originalScript] : []
    };
    setCurrentSession(newSession);
    
    // Start processing and analysis
    if (threads && threads.length > 0) {
      processThreadAnnotations(threads);
      generateSuggestions();
    }
    
    showNotification('Training session started!', 'info');
  }, [originalScript, editCaptures.length, learningPatterns.length, suggestions.length, threads, processThreadAnnotations, generateSuggestions]);

  const endTrainingSession = useCallback(() => {
    if (currentSession) {
      const updatedSession = {
        ...currentSession,
        endTime: new Date(),
        editsCount: editCaptures.length,
        patternsIdentified: learningPatterns.length,
        suggestionsGenerated: suggestions.length,
      };
      setCurrentSession(null);
      console.log('Training session ended:', updatedSession);
      showNotification(
        `Training session completed! Processed ${updatedSession.editsCount} edits, identified ${updatedSession.patternsIdentified} patterns.`,
        'success'
      );
    }
  }, [currentSession, editCaptures.length, learningPatterns.length, suggestions.length]);

  // Initialize megaprompt versioning system
  useEffect(() => {
    initializeMegaPromptVersioning();
  }, []);

  // Load megaprompt suggestions and version history
  const loadMegaPromptData = useCallback(async () => {
    try {
      // Load pending suggestions
      const suggestionsResponse = await fetch('/api/megaprompt-suggestions');
      if (suggestionsResponse.ok) {
        const data = await suggestionsResponse.json();
        setMegaPromptSuggestions(data.suggestions || []);
      }

      // Load version history
      const versionsResponse = await fetch('/api/megaprompt-suggestions?action=versions');
      if (versionsResponse.ok) {
        const data = await versionsResponse.json();
        setVersionHistory(data.versions || []);
      }
    } catch (error) {
      console.error('Error loading megaprompt data:', error);
    }
  }, []);

  // Generate new megaprompt suggestions
  const generateMegaPromptSuggestions = useCallback(async () => {
    setIsProcessing(true);
    try {
      const response = await fetch('/api/megaprompt-suggestions?action=generate', {
        method: 'GET',
      });

      if (response.ok) {
        const data = await response.json();
        setMegaPromptSuggestions(data.suggestions || []);
        showNotification(
          `Generated ${data.generated} new megaprompt suggestions based on ${data.basedOnPatterns} patterns!`,
          'success'
        );
      } else {
        throw new Error('Failed to generate suggestions');
      }
    } catch (error) {
      console.error('Error generating megaprompt suggestions:', error);
      showNotification('Failed to generate megaprompt suggestions. Please try again.', 'error');
    } finally {
      setIsProcessing(false);
    }
  }, []);

  // Accept megaprompt suggestion
  const acceptMegaPromptSuggestion = useCallback(async (suggestionId: string, description?: string) => {
    setIsProcessing(true);
    try {
      const response = await fetch('/api/megaprompt-suggestions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'accept',
          suggestionId,
          description
        }),
      });

      if (response.ok) {
        const data = await response.json();
        
        // Remove accepted suggestion from list
        setMegaPromptSuggestions(prev => prev.filter(s => s.id !== suggestionId));
        
        // Add new version to history
        setVersionHistory(prev => [...prev, data.version]);
        
        showNotification('Megaprompt suggestion accepted and applied!', 'success');
      } else {
        throw new Error('Failed to accept suggestion');
      }
    } catch (error) {
      console.error('Error accepting megaprompt suggestion:', error);
      showNotification('Failed to accept suggestion. Please try again.', 'error');
    } finally {
      setIsProcessing(false);
    }
  }, []);

  // Reject megaprompt suggestion
  const rejectMegaPromptSuggestion = useCallback(async (suggestionId: string) => {
    try {
      const response = await fetch('/api/megaprompt-suggestions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'reject',
          suggestionId
        }),
      });

      if (response.ok) {
        // Remove rejected suggestion from list
        setMegaPromptSuggestions(prev => prev.filter(s => s.id !== suggestionId));
        showNotification('Suggestion rejected', 'info');
      } else {
        throw new Error('Failed to reject suggestion');
      }
    } catch (error) {
      console.error('Error rejecting megaprompt suggestion:', error);
      showNotification('Failed to reject suggestion. Please try again.', 'error');
    }
  }, []);

  // Rollback to previous version
  const rollbackToVersion = useCallback(async (versionId: string) => {
    setIsProcessing(true);
    try {
      const response = await fetch('/api/megaprompt-suggestions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'rollback',
          versionId
        }),
      });

      if (response.ok) {
        // Reload version history to reflect rollback
        await loadMegaPromptData();
        showNotification('Successfully rolled back to selected version!', 'success');
      } else {
        throw new Error('Failed to rollback');
      }
    } catch (error) {
      console.error('Error rolling back version:', error);
      showNotification('Failed to rollback. Please try again.', 'error');
    } finally {
      setIsProcessing(false);
    }
  }, [loadMegaPromptData]);

  // Load megaprompt data on component mount
  useEffect(() => {
    loadMegaPromptData();
  }, [loadMegaPromptData]);

  // Auto-analyze patterns when threads change
  useEffect(() => {
    if (threads && threads.length > 0 && editCaptures.length > 0) {
      analyzePatterns();
    }
  }, [threads, editCaptures, analyzePatterns]);

  return {
    editCaptures,
    learningPatterns,
    suggestions,
    megaPromptSuggestions,
    versionHistory,
    currentSession,
    isProcessing,
    captureEdit,
    processThreadAnnotations,
    generateSuggestions,
    generateMegaPromptSuggestions,
    acceptMegaPromptSuggestion,
    rejectMegaPromptSuggestion,
    rollbackToVersion,
    applyPattern,
    acceptSuggestion,
    rejectSuggestion,
    startTrainingSession,
    endTrainingSession
  };
} 