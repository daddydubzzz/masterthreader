// MegaPrompt data types
export interface MegaPromptItem {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  category: 'core' | 'style' | 'advanced' | 'examples';
  content?: string;
}

// Main LeftPanel props
export interface LeftPanelProps {
  onMegaPromptChange?: (megaPrompt: MegaPromptItem) => void;
}

// Component props
export interface MegaPromptCardProps {
  megaPrompt: MegaPromptItem;
  onEdit?: () => void;
  onToggleActive?: () => void;
  isReadOnly?: boolean;
}

export interface MegaPromptFormProps {
  megaPrompt?: MegaPromptItem;
  onSave: (megaPrompt: MegaPromptItem) => void;
  onCancel: () => void;
  isOpen: boolean;
}

// Hook return types
export interface UseLeftPanelReturn {
  megaPrompts: MegaPromptItem[];
  activeMegaPrompts: MegaPromptItem[];
  isCreating: boolean;
  isEditing: boolean;
  editingMegaPrompt: MegaPromptItem | undefined;
  handleMegaPromptCreate: () => void;
  handleMegaPromptEdit: (megaPrompt: MegaPromptItem) => void;
  handleMegaPromptSave: (megaPrompt: MegaPromptItem) => void;
  handleMegaPromptToggle: (id: string) => void;
  handleFormCancel: () => void;
} 