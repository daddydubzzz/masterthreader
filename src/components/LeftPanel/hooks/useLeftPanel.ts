import { useState, useCallback, useMemo, useEffect } from 'react';
import { UseLeftPanelReturn, MegaPromptItem } from '../types';

export function useLeftPanel(
  onMegaPromptChange?: (megaPrompt: MegaPromptItem) => void
): UseLeftPanelReturn {
  // State management
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingMegaPrompt, setEditingMegaPrompt] = useState<MegaPromptItem | undefined>();

  // Real data - these are the actual megaprompt components that exist
  const [megaPrompts, setMegaPrompts] = useState<MegaPromptItem[]>([
    {
      id: 'core',
      name: 'Core Instructions',
      description: 'Primary thread generation logic and formatting rules',
      isActive: true,
      category: 'core',
      content: 'Loading...'
    },
    {
      id: 'style',
      name: 'Style Rules',
      description: 'Writing style, tone, and voice guidelines',
      isActive: true,
      category: 'style',
      content: 'Loading...'
    },
    {
      id: 'examples',
      name: 'Examples',
      description: 'High-performing thread examples and patterns',
      isActive: true,
      category: 'examples',
      content: 'Loading...'
    },
    {
      id: 'advanced',
      name: 'Advanced Rules',
      description: 'Advanced formatting and engagement optimization',
      isActive: true,
      category: 'advanced',
      content: 'Loading...'
    }
  ]);

  // Load actual content from files
  useEffect(() => {
    const loadMegaPromptContent = async () => {
      const fileMap = {
        'core': 'megaprompt-core.txt',
        'style': 'megaprompt-style-rules.txt',
        'examples': 'megaprompt-examples.txt',
        'advanced': 'megaprompt-advanced-rules.txt'
      };

      for (const [id, filename] of Object.entries(fileMap)) {
        try {
          const response = await fetch(`/${filename}`);
          if (response.ok) {
            const content = await response.text();
            setMegaPrompts(prev => 
              prev.map(mp => 
                mp.id === id ? { ...mp, content } : mp
              )
            );
          } else {
            setMegaPrompts(prev => 
              prev.map(mp => 
                mp.id === id ? { ...mp, content: 'Failed to load content' } : mp
              )
            );
          }
        } catch (error) {
          console.error(`Error loading ${filename}:`, error);
          setMegaPrompts(prev => 
            prev.map(mp => 
              mp.id === id ? { ...mp, content: 'Error loading content' } : mp
            )
          );
        }
      }
    };

    loadMegaPromptContent();
  }, []);

  // Get active megaprompts that will be used for generation
  const activeMegaPrompts = useMemo(() => 
    megaPrompts.filter(mp => mp.isActive), 
    [megaPrompts]
  );

  // Event handlers
  const handleMegaPromptCreate = useCallback(() => {
    setIsCreating(true);
    setEditingMegaPrompt(undefined);
  }, []);

  const handleMegaPromptEdit = useCallback((megaPrompt: MegaPromptItem) => {
    setIsEditing(true);
    setEditingMegaPrompt(megaPrompt);
  }, []);

  const handleMegaPromptSave = useCallback((megaPrompt: MegaPromptItem) => {
    if (isCreating) {
      // Add new megaprompt
      const newMegaPrompt = {
        ...megaPrompt,
        id: `custom-${Date.now()}`
      };
      setMegaPrompts(prev => [...prev, newMegaPrompt]);
      onMegaPromptChange?.(newMegaPrompt);
    } else if (isEditing && editingMegaPrompt) {
      // Update existing megaprompt
      const updatedMegaPrompt = {
        ...megaPrompt,
        id: editingMegaPrompt.id
      };
      setMegaPrompts(prev => 
        prev.map(mp => mp.id === editingMegaPrompt.id ? updatedMegaPrompt : mp)
      );
      onMegaPromptChange?.(updatedMegaPrompt);
    }

    // Reset form state
    setIsCreating(false);
    setIsEditing(false);
    setEditingMegaPrompt(undefined);
  }, [isCreating, isEditing, editingMegaPrompt, onMegaPromptChange]);

  const handleMegaPromptToggle = useCallback((id: string) => {
    setMegaPrompts(prev => 
      prev.map(mp => 
        mp.id === id 
          ? { ...mp, isActive: !mp.isActive }
          : mp
      )
    );
  }, []);

  const handleFormCancel = useCallback(() => {
    setIsCreating(false);
    setIsEditing(false);
    setEditingMegaPrompt(undefined);
  }, []);

  return {
    megaPrompts,
    activeMegaPrompts,
    isCreating,
    isEditing,
    editingMegaPrompt,
    handleMegaPromptCreate,
    handleMegaPromptEdit,
    handleMegaPromptSave,
    handleMegaPromptToggle,
    handleFormCancel
  };
} 