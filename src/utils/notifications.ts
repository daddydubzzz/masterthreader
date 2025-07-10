// Simple notification utility
// In a real app, this would integrate with a proper notification system like react-toastify

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export function showNotification(
  message: string, 
  type: NotificationType = 'info', 
  duration: number = 3000
): void {
  // For now, just log to console
  // In production, this would show actual UI notifications
  const prefix = type.toUpperCase();
  console.log(`[${prefix}] ${message}`);
  
  // In a real implementation, you might:
  // - Show a toast notification
  // - Add to a notification queue
  // - Update a global notification state
  // - Send to an analytics service
  
  // Simple browser notification for development
  if (typeof window !== 'undefined' && window.Notification) {
    // Request permission if needed
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }
    
    // Show notification if permission granted
    if (Notification.permission === 'granted') {
      new Notification(`MasterThreader - ${type}`, {
        body: message,
        icon: '/favicon.ico',
        tag: 'masterthreader-notification'
      });
    }
  }
  
  // Auto-dismiss after duration
  if (duration > 0) {
    setTimeout(() => {
      // In a real implementation, this would remove the notification from UI
      console.log(`[${prefix}] Notification dismissed: ${message}`);
    }, duration);
  }
} 