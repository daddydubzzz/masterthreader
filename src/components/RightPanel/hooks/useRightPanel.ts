import { useState, useCallback, useEffect } from 'react';
import { Thread } from '@/types';
import { 
  UseRightPanelReturn, 
  EditCapture, 
  LearningPattern, 
  MegaPromptSuggestion, 
  TrainingSession 
} from '../types';

export function useRightPanel(
  generatedThreads?: Thread[],
  originalScript?: string,
  selectedMegaPrompt?: string,
  onMegaPromptSuggestion?: (suggestion: string) => void
): UseRightPanelReturn {
  // State management
  const [editCaptures, setEditCaptures] = useState<EditCapture[]>([]);
  const [learningPatterns, setLearningPatterns] = useState<LearningPattern[]>([]);
  const [suggestions, setSuggestions] = useState<MegaPromptSuggestion[]>([]);
  const [currentSession, setCurrentSession] = useState<TrainingSession | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Edit capture functionality
  const captureEdit = useCallback((edit: Omit<EditCapture, 'id' | 'timestamp'>) => {
    const newEdit: EditCapture = {
      ...edit,
      id: `edit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date()
    };

    setEditCaptures(prev => [newEdit, ...prev.slice(0, 19)]); // Keep last 20 edits

    // Update current session
    if (currentSession) {
      setCurrentSession(prev => prev ? {
        ...prev,
        editsCount: prev.editsCount + 1
      } : null);
    }
  }, [currentSession]);

  // Process thread annotations to identify patterns
  const processThreadAnnotations = useCallback(async (threads: Thread[]) => {
    if (!threads?.length) return;

    setIsProcessing(true);

    try {
      // Simulate AI pattern analysis
      const response = await fetch('/api/analyze-patterns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          threads,
          originalScript,
          megaPrompt: selectedMegaPrompt,
          recentEdits: editCaptures.slice(0, 10)
        })
      });

      if (response.ok) {
        const { patterns } = await response.json();
        
        setLearningPatterns(prev => {
          const newPatterns = patterns.filter((p: LearningPattern) => 
            !prev.some(existing => existing.id === p.id)
          );
          return [...newPatterns, ...prev].slice(0, 15); // Keep top 15 patterns
        });

        // Update session
        if (currentSession) {
          setCurrentSession(prev => prev ? {
            ...prev,
            patternsIdentified: prev.patternsIdentified + patterns.length
          } : null);
        }
      }
    } catch (error) {
      console.error('Pattern analysis failed:', error);
    } finally {
      setIsProcessing(false);
    }
  }, [originalScript, selectedMegaPrompt, editCaptures, currentSession]);

  // Generate megaprompt suggestions based on learned patterns
  const generateSuggestions = useCallback(async () => {
    if (editCaptures.length === 0 && learningPatterns.length === 0) return;

    setIsProcessing(true);

    try {
      const response = await fetch('/api/generate-suggestions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          editCaptures: editCaptures.slice(0, 10),
          learningPatterns: learningPatterns.slice(0, 5),
          currentMegaPrompt: selectedMegaPrompt,
          originalScript
        })
      });

      if (response.ok) {
        const { suggestions: newSuggestions } = await response.json();
        
        setSuggestions(prev => {
          const filteredSuggestions = newSuggestions.filter((s: MegaPromptSuggestion) => 
            !prev.some(existing => existing.id === s.id)
          );
          return [...filteredSuggestions, ...prev].slice(0, 10); // Keep top 10 suggestions
        });

        // Update session
        if (currentSession) {
          setCurrentSession(prev => prev ? {
            ...prev,
            suggestionsGenerated: prev.suggestionsGenerated + newSuggestions.length
          } : null);
        }
      }
    } catch (error) {
      console.error('Suggestion generation failed:', error);
    } finally {
      setIsProcessing(false);
    }
  }, [editCaptures, learningPatterns, selectedMegaPrompt, originalScript, currentSession]);

  // Apply a learning pattern
  const applyPattern = useCallback((patternId: string) => {
    const pattern = learningPatterns.find(p => p.id === patternId);
    if (pattern) {
      // Increase pattern frequency and update last seen
      setLearningPatterns(prev => 
        prev.map(p => 
          p.id === patternId 
            ? { ...p, frequency: p.frequency + 1, lastSeen: new Date() }
            : p
        )
      );
    }
  }, [learningPatterns]);

  // Accept a megaprompt suggestion
  const acceptSuggestion = useCallback((suggestionId: string) => {
    const suggestion = suggestions.find(s => s.id === suggestionId);
    if (suggestion) {
      // Call the callback to update the megaprompt
      onMegaPromptSuggestion?.(suggestion.suggestedRule);
      
      // Remove the accepted suggestion
      setSuggestions(prev => prev.filter(s => s.id !== suggestionId));
    }
  }, [suggestions, onMegaPromptSuggestion]);

  // Reject a suggestion
  const rejectSuggestion = useCallback((suggestionId: string) => {
    setSuggestions(prev => prev.filter(s => s.id !== suggestionId));
  }, []);

  // Training session management
  const startTrainingSession = useCallback(() => {
    const session: TrainingSession = {
      id: `session-${Date.now()}`,
      startTime: new Date(),
      editsCount: 0,
      patternsIdentified: 0,
      suggestionsGenerated: 0,
      scriptsProcessed: originalScript ? [originalScript] : []
    };
    setCurrentSession(session);
  }, [originalScript]);

  const endTrainingSession = useCallback(() => {
    if (currentSession) {
      setCurrentSession(prev => prev ? {
        ...prev,
        endTime: new Date()
      } : null);
      
      // Clear session after a brief delay to show completion
      setTimeout(() => {
        setCurrentSession(null);
      }, 3000);
    }
  }, [currentSession]);

  // Auto-start training session when threads are generated
  useEffect(() => {
    if (generatedThreads && generatedThreads.length > 0 && !currentSession) {
      startTrainingSession();
    }
  }, [generatedThreads, currentSession, startTrainingSession]);

  // Auto-generate suggestions when patterns are updated
  useEffect(() => {
    if (learningPatterns.length > 0 && editCaptures.length > 2) {
      const timer = setTimeout(() => {
        generateSuggestions();
      }, 2000); // Debounce suggestions generation

      return () => clearTimeout(timer);
    }
  }, [learningPatterns.length, editCaptures.length, generateSuggestions]);

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