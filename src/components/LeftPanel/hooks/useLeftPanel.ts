import { useState, useCallback } from 'react';
import { UseLeftPanelReturn, MegaPromptItem } from '../types';

export function useLeftPanel(
  selectedMegaPrompt?: string,
  onMegaPromptSelect?: (id: string) => void,
  onMegaPromptChange?: (megaPrompt: MegaPromptItem) => void
): UseLeftPanelReturn {
  // State management
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingMegaPrompt, setEditingMegaPrompt] = useState<MegaPromptItem | undefined>();

  // Mock data - in real app, this would come from API/database
  const [megaPrompts, setMegaPrompts] = useState<MegaPromptItem[]>([
    {
      id: 'core',
      name: 'Core Megaprompt',
      description: 'Primary thread generation logic and formatting rules',
      isActive: true,
      category: 'core',
      lastModified: new Date('2024-01-15'),
      version: '2.1'
    },
    {
      id: 'style',
      name: 'Style Rules',
      description: 'Writing style, tone, and voice guidelines',
      isActive: true,
      category: 'style',
      lastModified: new Date('2024-01-10'),
      version: '1.8'
    },
    {
      id: 'advanced',
      name: 'Advanced Rules',
      description: 'Advanced formatting and engagement optimization',
      isActive: false,
      category: 'advanced',
      lastModified: new Date('2024-01-05'),
      version: '1.2'
    },
    {
      id: 'examples',
      name: 'Examples',
      description: 'High-performing thread examples and patterns',
      isActive: true,
      category: 'examples',
      lastModified: new Date('2024-01-12'),
      version: '3.0'
    }
  ]);

  // Event handlers
  const handleMegaPromptSelect = useCallback((id: string) => {
    onMegaPromptSelect?.(id);
  }, [onMegaPromptSelect]);

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
        id: `custom-${Date.now()}`,
        lastModified: new Date(),
        version: '1.0'
      };
      setMegaPrompts(prev => [...prev, newMegaPrompt]);
      onMegaPromptChange?.(newMegaPrompt);
    } else if (isEditing && editingMegaPrompt) {
      // Update existing megaprompt
      const updatedMegaPrompt = {
        ...megaPrompt,
        id: editingMegaPrompt.id,
        lastModified: new Date(),
        version: editingMegaPrompt.version || '1.0'
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
          ? { ...mp, isActive: !mp.isActive, lastModified: new Date() }
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
    selectedMegaPrompt,
    isCreating,
    isEditing,
    editingMegaPrompt,
    handleMegaPromptSelect,
    handleMegaPromptCreate,
    handleMegaPromptEdit,
    handleMegaPromptSave,
    handleMegaPromptToggle,
    handleFormCancel
  };
} 