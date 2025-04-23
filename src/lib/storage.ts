
// Types for our data model
export interface Food {
  id: number;
  name: string;
  price: number;
}

export interface Booking {
  id: string;
  food: Food;
  quantity: number;
  drink: string | null;
  paymentMode: 'Mobile Money' | 'Cash';
  location: string;
  additionalInfo: string;
  phoneNumber: string;
  deliveryTime: string;
  status: 'Pending' | 'Confirmed' | 'Delivered' | 'Cancelled';
  createdAt: string;
}

export interface Settings {
  backgroundImage: string;
  email: {
    host: string;
    port: string;
    user: string;
    password: string;
  };
  sms: {
    apiKey: string;
    senderId: string;
  };
}

// Food menu data
export const foodMenu: Food[] = [
  { id: 1, name: 'Assorted Fried Rice with Beef and Fries', price: 50 },
  { id: 2, name: 'Assorted Fried Rice with Chicken and Fries', price: 45 },
  { id: 3, name: 'Assorted Jollof Rice with Chicken', price: 30 },
  { id: 4, name: 'Jollof Rice with Beef and Goat', price: 25 },
  { id: 5, name: 'Jollof Rice with Grilled Pork and Fried Chicken', price: 20 },
];

export const drinkOptions = ['Fresh Yogurt', 'Coca Cola', 'Fanta'];

export const locationOptions = [
  'Superannuation', 
  'New Site', 
  'Old Site', 
  'Science', 
  'Amamoma', 
  'Ayensu', 
  'Kwaprow', 
  'SNTT', 
  'Sasakawa'
];

// Generate a unique order ID
export const generateOrderId = (): string => {
  const prefix = 'MD';
  const timestamp = new Date().getTime().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${prefix}${timestamp}${random}`;
};

// Storage functions for bookings
export const saveBooking = (booking: Booking): void => {
  const bookings = getBookings();
  bookings.push(booking);
  localStorage.setItem('bookings', JSON.stringify(bookings));
};

export const getBookings = (): Booking[] => {
  const bookings = localStorage.getItem('bookings');
  return bookings ? JSON.parse(bookings) : [];
};

export const getBookingById = (id: string): Booking | undefined => {
  const bookings = getBookings();
  return bookings.find(booking => booking.id === id);
};

export const updateBooking = (id: string, updates: Partial<Booking>): boolean => {
  const bookings = getBookings();
  const index = bookings.findIndex(booking => booking.id === id);
  
  if (index !== -1) {
    bookings[index] = { ...bookings[index], ...updates };
    localStorage.setItem('bookings', JSON.stringify(bookings));
    return true;
  }
  
  return false;
};

export const deleteBooking = (id: string): boolean => {
  const bookings = getBookings();
  const filteredBookings = bookings.filter(booking => booking.id !== id);
  
  if (filteredBookings.length !== bookings.length) {
    localStorage.setItem('bookings', JSON.stringify(filteredBookings));
    return true;
  }
  
  return false;
};

// Storage functions for settings
export const defaultSettings: Settings = {
  backgroundImage: 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b',
  email: {
    host: '',
    port: '',
    user: '',
    password: '',
  },
  sms: {
    apiKey: '',
    senderId: 'MeatDoctor',
  },
};

export const getSettings = (): Settings => {
  const settings = localStorage.getItem('settings');
  return settings ? JSON.parse(settings) : defaultSettings;
};

export const saveSettings = (settings: Settings): void => {
  localStorage.setItem('settings', JSON.stringify(settings));
};

// Admin authentication
export const createAdminSession = (email: string): void => {
  // Set token expiry to 30 minutes from now
  const expiry = new Date().getTime() + 30 * 60 * 1000;
  
  localStorage.setItem('adminEmail', email);
  localStorage.setItem('adminToken', 'mock-token-' + Math.random().toString(36).substring(2));
  localStorage.setItem('tokenExpiry', expiry.toString());
};

export const isAdminAuthenticated = (): boolean => {
  const token = localStorage.getItem('adminToken');
  const expiry = localStorage.getItem('tokenExpiry');
  
  return !!(token && expiry && new Date().getTime() < parseInt(expiry));
};

export const clearAdminSession = (): void => {
  localStorage.removeItem('adminEmail');
  localStorage.removeItem('adminToken');
  localStorage.removeItem('tokenExpiry');
};

// Analytics helpers
export const getAnalytics = () => {
  const bookings = getBookings();
  
  // Total bookings
  const totalBookings = bookings.length;
  
  // Total revenue
  const totalRevenue = bookings.reduce((sum, booking) => {
    return sum + (booking.food.price * booking.quantity);
  }, 0);
  
  // Popular food items
  const foodCounts: Record<string, number> = {};
  bookings.forEach(booking => {
    foodCounts[booking.food.name] = (foodCounts[booking.food.name] || 0) + booking.quantity;
  });
  
  const popularFoods = Object.entries(foodCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 3); // Top 3
  
  // Status counts
  const statusCounts: Record<string, number> = {};
  bookings.forEach(booking => {
    statusCounts[booking.status] = (statusCounts[booking.status] || 0) + 1;
  });
  
  return {
    totalBookings,
    totalRevenue,
    popularFoods,
    statusCounts,
  };
};
