// MegaPrompt data types
export interface MegaPromptItem {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  category: 'core' | 'style' | 'advanced' | 'examples';
  content?: string;
  lastModified?: Date;
  version?: string;
}

// Main LeftPanel props
export interface LeftPanelProps {
  selectedMegaPrompt?: string;
  onMegaPromptSelect: (megaPromptId: string) => void;
  onMegaPromptChange?: (megaPrompt: MegaPromptItem) => void;
}

// Component props
export interface MegaPromptCardProps {
  megaPrompt: MegaPromptItem;
  isSelected: boolean;
  onClick: () => void;
  onEdit?: () => void;
  onToggleActive?: () => void;
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
  selectedMegaPrompt: string | undefined;
  isCreating: boolean;
  isEditing: boolean;
  editingMegaPrompt: MegaPromptItem | undefined;
  handleMegaPromptSelect: (id: string) => void;
  handleMegaPromptCreate: () => void;
  handleMegaPromptEdit: (megaPrompt: MegaPromptItem) => void;
  handleMegaPromptSave: (megaPrompt: MegaPromptItem) => void;
  handleMegaPromptToggle: (id: string) => void;
  handleFormCancel: () => void;
} 