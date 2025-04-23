
// Sound notification system
let notificationSound: HTMLAudioElement | null = null;

// Initialize the notification sound
export const initNotificationSound = () => {
  if (typeof window !== 'undefined' && !notificationSound) {
    notificationSound = new Audio('/notification-sound.mp3');
    notificationSound.preload = 'auto';
  }
};

// Play notification sound
export const playNotificationSound = () => {
  if (notificationSound) {
    notificationSound.currentTime = 0;
    notificationSound.play().catch(error => {
      console.error('Error playing notification sound:', error);
    });
  }
};

// Check for new orders and trigger notification
export const checkForNewOrders = (currentCount: number, previousCount: number) => {
  if (currentCount > previousCount) {
    playNotificationSound();
    return true;
  }
  return false;
};
