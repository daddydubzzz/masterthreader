import { Thread, MegaPrompt } from '@/types';

export interface PersistedThreadData {
  threads: Thread[];
  megaPrompt: MegaPrompt;
  originalScript: string;
  timestamp: number;
}

const STORAGE_KEY = 'master_threader_threads';
const EXPIRY_TIME = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
const CLEANUP_KEY = 'master_threader_last_cleanup';
const CLEANUP_INTERVAL = 60 * 60 * 1000; // 1 hour in milliseconds

export function saveThreadsToStorage(
  threads: Thread[],
  megaPrompt: MegaPrompt,
  originalScript: string
): void {
  try {
    const data: PersistedThreadData = {
      threads,
      megaPrompt,
      originalScript,
      timestamp: Date.now()
    };
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    
    // Run cleanup periodically
    runCleanupIfNeeded();
  } catch (error) {
    console.warn('Failed to save threads to localStorage:', error);
  }
}

export function loadThreadsFromStorage(): PersistedThreadData | null {
  try {
    // Run cleanup before loading
    runCleanupIfNeeded();
    
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    
    const data: PersistedThreadData = JSON.parse(stored);
    
    // Check if data is expired
    const now = Date.now();
    const isExpired = now - data.timestamp > EXPIRY_TIME;
    
    if (isExpired) {
      clearThreadsFromStorage();
      return null;
    }
    
    return data;
  } catch (error) {
    console.warn('Failed to load threads from localStorage:', error);
    return null;
  }
}

export function clearThreadsFromStorage(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.warn('Failed to clear threads from localStorage:', error);
  }
}

export function hasPersistedThreads(): boolean {
  const data = loadThreadsFromStorage();
  return data !== null && data.threads.length > 0;
}

function runCleanupIfNeeded(): void {
  try {
    const lastCleanup = localStorage.getItem(CLEANUP_KEY);
    const now = Date.now();
    
    if (!lastCleanup || now - parseInt(lastCleanup) > CLEANUP_INTERVAL) {
      // Clear expired data
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        const parsed: PersistedThreadData = JSON.parse(data);
        if (now - parsed.timestamp > EXPIRY_TIME) {
          clearThreadsFromStorage();
        }
      }
      
      // Update last cleanup time
      localStorage.setItem(CLEANUP_KEY, now.toString());
    }
  } catch (error) {
    console.warn('Failed to run cleanup:', error);
  }
}

// Export cleanup function for manual use
export function forceCleanup(): void {
  runCleanupIfNeeded();
} 