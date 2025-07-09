import { Thread, Annotation } from '@/types';

export interface ThreadDisplayProps {
  threads: Thread[];
  onThreadsUpdated: (threads: Thread[]) => void;
  onRecursionRequested: () => Promise<void>;
  scriptTitle?: string; // For vector DB context and organization
}

export interface ThreadCardProps {
  thread: Thread;
  threadIndex: number;
  onThreadUpdated: (updatedThread: Thread) => void;
}

export interface TweetProps {
  content: string;
  tweetIndex: number;
  threadIndex: number;
  onTweetEdited: (newContent: string) => void;
  onAnnotationAdded: (annotation: string, type: Annotation['type']) => void;
  annotations: Annotation[];
  isEditing: boolean;
  onStartEdit: () => void;
  onEndEdit: () => void;
}

export interface AnnotationBoxProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (text: string, type: Annotation['type']) => void;
  existingAnnotations: Annotation[];
}

export interface RecursionButtonProps {
  visible: boolean;
  onClick: () => Promise<void>;
  isLoading?: boolean;
} 