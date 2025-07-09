import { useState, useCallback, useEffect } from 'react';
import { Thread } from '@/types';
import { UseRightPanelReturn, EditCapture, LearningPattern, MegaPromptSuggestion, TrainingSession } from '../types';

export function useRightPanel(
  threads?: Thread[],
  originalScript?: string
): UseRightPanelReturn {
  // State management
  const [editCaptures, setEditCaptures] = useState<EditCapture[]>([]);
  const [learningPatterns, setLearningPatterns] = useState<LearningPattern[]>([]);
  const [suggestions, setSuggestions] = useState<MegaPromptSuggestion[]>([]);
  const [currentSession, setCurrentSession] = useState<TrainingSession | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Mock data for demonstration
  useEffect(() => {
    if (threads && threads.length > 0) {
      // Mock some suggestions based on thread content
      const mockSuggestions: MegaPromptSuggestion[] = [
        {
          id: 'suggestion-1',
          type: 'addition',
          category: 'style',
          suggestedRule: 'Emphasize emotional hooks in thread openings',
          reasoning: 'Detected pattern of successful threads starting with emotional elements',
          basedOnEdits: ['edit-1', 'edit-2'],
          confidence: 0.85,
          priority: 'high'
        },
        {
          id: 'suggestion-2',
          type: 'modification',
          category: 'core',
          currentRule: 'Keep threads under 8 tweets',
          suggestedRule: 'Optimize threads to 6-7 tweets for better engagement',
          reasoning: 'Analysis shows shorter threads perform better in your style',
          basedOnEdits: ['edit-3'],
          confidence: 0.72,
          priority: 'medium'
        }
      ];
      setSuggestions(mockSuggestions);

      // Mock learning patterns
      const mockPatterns: LearningPattern[] = [
        {
          id: 'pattern-1',
          patternType: 'style',
          description: 'User prefers conversational tone with direct questions',
          examples: ['What if I told you...', 'Here\'s the thing...'],
          confidence: 0.9,
          frequency: 12,
          lastSeen: new Date()
        }
      ];
      setLearningPatterns(mockPatterns);
    }
  }, [threads]);

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
      // Mock processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock processing results
      console.log('Processing threads for annotations:', threadsToProcess.length);
      
    } catch (error) {
      console.error('Error processing thread annotations:', error);
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const generateSuggestions = useCallback(async () => {
    setIsProcessing(true);
    try {
      // Mock suggestion generation
      await new Promise(resolve => setTimeout(resolve, 1500));
      console.log('Generated new suggestions based on patterns');
    } catch (error) {
      console.error('Error generating suggestions:', error);
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const applyPattern = useCallback((patternId: string) => {
    console.log('Applying pattern:', patternId);
    // Implementation for applying a learned pattern
  }, []);

  const acceptSuggestion = useCallback((suggestionId: string) => {
    setSuggestions(prev => prev.filter(s => s.id !== suggestionId));
    console.log('Accepted suggestion:', suggestionId);
  }, []);

  const rejectSuggestion = useCallback((suggestionId: string) => {
    setSuggestions(prev => prev.filter(s => s.id !== suggestionId));
    console.log('Rejected suggestion:', suggestionId);
  }, []);

  const startTrainingSession = useCallback(() => {
    const newSession: TrainingSession = {
      id: `session-${Date.now()}`,
      startTime: new Date(),
      editsCount: 0,
      patternsIdentified: 0,
      suggestionsGenerated: 0,
      scriptsProcessed: originalScript ? [originalScript] : []
    };
    setCurrentSession(newSession);
  }, [originalScript]);

  const endTrainingSession = useCallback(() => {
    if (currentSession) {
      const updatedSession = {
        ...currentSession,
        endTime: new Date()
      };
      setCurrentSession(null);
      console.log('Training session ended:', updatedSession);
    }
  }, [currentSession]);

  return {
    editCaptures,
    learningPatterns,
    suggestions,
    currentSession,
    isProcessing,
    captureEdit,
    processThreadAnnotations,
    generateSuggestions,
    applyPattern,
    acceptSuggestion,
    rejectSuggestion,
    startTrainingSession,
    endTrainingSession
  };
} 