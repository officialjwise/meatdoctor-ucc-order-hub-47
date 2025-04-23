// Types for our data model
export interface Food {
  id: number;
  name: string;
  price: number;
  description?: string;
  options?: FoodOption[];
  imageUrl?: string;
  images?: string[];
  locationIds?: number[];
}

export interface FoodOption {
  id: number;
  name: string;
  price: number;
}

export interface Booking {
  id: string;
  food: Food;
  quantity: number;
  drink: string | null;
  paymentMode: string;
  location: string;
  additionalInfo: string;
  phoneNumber: string;
  deliveryTime: string;
  status: 'Pending' | 'Confirmed' | 'Delivered' | 'Cancelled';
  createdAt: string;
}

export interface Location {
  id: number;
  name: string;
  description?: string;
  active: boolean;
}

export interface PaymentMode {
  id: number;
  name: string;
  description?: string;
  active: boolean;
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
    clientId: string;
    clientSecret: string;
    senderId: string;
  };
  theme: 'light' | 'dark';
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
    clientId: '',
    clientSecret: '',
    senderId: 'MeatDoctor',
  },
  theme: 'light',
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

// CRUD operations for Food items
export const getFoods = (): Food[] => {
  const foods = localStorage.getItem('foods');
  return foods ? JSON.parse(foods) : foodMenu;
};

export const saveFood = (food: Food): Food => {
  const foods = getFoods();
  
  // Check if it's an update or a new item
  const exists = foods.findIndex(f => f.id === food.id) !== -1;
  
  // If it's a new food item, generate a new ID
  if (!exists) {
    // Get the highest ID and increment by 1
    const maxId = foods.reduce((max, food) => Math.max(max, food.id), 0);
    food.id = maxId + 1;
  }
  
  // Update or add the food item
  const updatedFoods = exists
    ? foods.map(f => f.id === food.id ? food : f)
    : [...foods, food];
  
  localStorage.setItem('foods', JSON.stringify(updatedFoods));
  return food;
};

export const deleteFood = (id: number): boolean => {
  const foods = getFoods();
  const filteredFoods = foods.filter(food => food.id !== id);
  
  if (filteredFoods.length !== foods.length) {
    localStorage.setItem('foods', JSON.stringify(filteredFoods));
    return true;
  }
  
  return false;
};

export const getFoodById = (id: number): Food | undefined => {
  const foods = getFoods();
  return foods.find(food => food.id === id);
};

// CRUD operations for Locations
export const getLocations = (): Location[] => {
  const locations = localStorage.getItem('locations');
  if (locations) return JSON.parse(locations);
  
  // Initialize with default locations
  const defaultLocations: Location[] = locationOptions.map((name, index) => ({
    id: index + 1,
    name,
    active: true
  }));
  
  localStorage.setItem('locations', JSON.stringify(defaultLocations));
  return defaultLocations;
};

export const saveLocation = (location: Location): Location => {
  const locations = getLocations();
  
  // Check if it's an update or a new item
  const exists = locations.findIndex(l => l.id === location.id) !== -1;
  
  // If it's a new location, generate a new ID
  if (!exists) {
    const maxId = locations.reduce((max, loc) => Math.max(max, loc.id), 0);
    location.id = maxId + 1;
  }
  
  // Update or add the location
  const updatedLocations = exists
    ? locations.map(l => l.id === location.id ? location : l)
    : [...locations, location];
  
  localStorage.setItem('locations', JSON.stringify(updatedLocations));
  return location;
};

export const deleteLocation = (id: number): boolean => {
  const locations = getLocations();
  const filteredLocations = locations.filter(location => location.id !== id);
  
  if (filteredLocations.length !== locations.length) {
    localStorage.setItem('locations', JSON.stringify(filteredLocations));
    return true;
  }
  
  return false;
};

// CRUD operations for Payment Modes
export const getPaymentModes = (): PaymentMode[] => {
  const paymentModes = localStorage.getItem('paymentModes');
  if (paymentModes) return JSON.parse(paymentModes);
  
  // Initialize with default payment modes
  const defaultPaymentModes: PaymentMode[] = [
    {
      id: 1,
      name: 'Mobile Money',
      description: 'Pay with MTN, Vodafone, or AirtelTigo Mobile Money',
      active: true
    },
    {
      id: 2,
      name: 'Cash',
      description: 'Pay with cash on delivery',
      active: true
    }
  ];
  
  localStorage.setItem('paymentModes', JSON.stringify(defaultPaymentModes));
  return defaultPaymentModes;
};

export const savePaymentMode = (paymentMode: PaymentMode): PaymentMode => {
  const paymentModes = getPaymentModes();
  
  // Check if it's an update or a new item
  const exists = paymentModes.findIndex(p => p.id === paymentMode.id) !== -1;
  
  // If it's a new payment mode, generate a new ID
  if (!exists) {
    const maxId = paymentModes.reduce((max, mode) => Math.max(max, mode.id), 0);
    paymentMode.id = maxId + 1;
  }
  
  // Update or add the payment mode
  const updatedPaymentModes = exists
    ? paymentModes.map(p => p.id === paymentMode.id ? paymentMode : p)
    : [...paymentModes, paymentMode];
  
  localStorage.setItem('paymentModes', JSON.stringify(updatedPaymentModes));
  return paymentMode;
};

export const deletePaymentMode = (id: number): boolean => {
  const paymentModes = getPaymentModes();
  const filteredPaymentModes = paymentModes.filter(mode => mode.id !== id);
  
  if (filteredPaymentModes.length !== paymentModes.length) {
    localStorage.setItem('paymentModes', JSON.stringify(filteredPaymentModes));
    return true;
  }
  
  return false;
};
