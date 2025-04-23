
import { showToast } from './alerts';

// Audio element for notification sound
let notificationSound: HTMLAudioElement | null = null;

// Initialize notification sound
export const initNotificationSound = () => {
  // Create audio element if it doesn't exist
  if (!notificationSound) {
    notificationSound = new Audio('/notification-sound.mp3');
    notificationSound.preload = 'auto';
  }
};

// Play notification sound
export const playNotificationSound = () => {
  if (notificationSound) {
    notificationSound.currentTime = 0;
    notificationSound.play().catch(error => {
      console.error('Failed to play notification sound:', error);
    });
  }
};

// Show notification with sound
export const showNotification = (title: string, options: { 
  sound?: boolean;
  icon?: 'success' | 'error' | 'warning' | 'info';
} = {}) => {
  const { sound = true, icon = 'info' } = options;
  
  if (sound) {
    playNotificationSound();
  }
  
  return showToast(title, icon);
};

// Check for new orders and notify
export const checkForNewOrders = (currentOrdersCount: number, previousOrdersCount: number) => {
  if (currentOrdersCount > previousOrdersCount) {
    const newOrdersCount = currentOrdersCount - previousOrdersCount;
    const message = newOrdersCount === 1 
      ? 'A new order has been placed!' 
      : `${newOrdersCount} new orders have been placed!`;
    
    // Use SweetAlert instead of toast for more prominence
    import('./alerts').then(({ showSuccessAlert }) => {
      showSuccessAlert(message, 'New order notification');
      playNotificationSound();
    });
    
    return true;
  }
  return false;
};
