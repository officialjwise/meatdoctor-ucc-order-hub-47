
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

// Send email notification for new order
export const sendOrderNotificationEmail = async (orderDetails: any) => {
  try {
    const { email } = getAdminEmailSettings();
    if (!email.apiKey || !email.fromEmail) {
      console.warn('Email settings not configured');
      return false;
    }
    
    // In a real app, this would call an API endpoint
    console.log('Sending email notification with details:', {
      to: email.fromEmail, // Admin email
      from: email.fromEmail,
      subject: `New Order: #${orderDetails.id}`,
      text: `
        New order has been placed!
        
        Order ID: ${orderDetails.id}
        Food: ${orderDetails.food.name}
        Quantity: ${orderDetails.quantity}
        Price: GHS ${orderDetails.food.price * orderDetails.quantity}
        Location: ${orderDetails.location}
        Delivery Time: ${new Date(orderDetails.deliveryTime).toLocaleString()}
        Contact: ${orderDetails.phoneNumber}
      `
    });
    
    return true;
  } catch (error) {
    console.error('Failed to send email notification:', error);
    return false;
  }
};

// Get admin email settings
const getAdminEmailSettings = () => {
  // Get settings from storage
  if (typeof window !== 'undefined') {
    try {
      const settingsStr = localStorage.getItem('settings');
      if (settingsStr) {
        return JSON.parse(settingsStr);
      }
    } catch (error) {
      console.error('Error retrieving email settings:', error);
    }
  }
  
  // Default settings
  return {
    email: {
      apiKey: '',
      fromEmail: 'admin@meatdoctorucc.com',
      fromName: 'MeatDoctor UCC'
    }
  };
};
