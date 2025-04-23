
// Mock storage for demo purposes
// In a real application, this would be replaced with API calls to a backend server

// Types
export interface Food {
  id: number;
  name: string;
  price: number;
  description?: string;
  imageUrl?: string;
  images?: string[];  // Multiple images for a food item
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

export interface Booking {
  id: string;
  food: Food;
  quantity: number;
  drink: string | null;
  paymentMode: string;
  location: string;
  additionalInfo?: string;
  phoneNumber: string;
  deliveryTime: string;
  status: 'Pending' | 'Confirmed' | 'Delivered' | 'Cancelled';
  createdAt: string;
}

export interface Analytics {
  totalBookings: number;
  totalRevenue: number;
  statusCounts: Record<string, number>;
  popularFoods: { name: string; count: number }[];
}

export interface SiteSettings {
  siteName: string;
  siteDescription: string;
  contactEmail: string;
  contactPhone: string;
  contactAddress: string;
  bgImageUrl: string;
  darkModeEnabled: boolean;
  notificationsEnabled: boolean;
  footerText: string;
}

// Drink options
export const drinkOptions = ['Coke', 'Fanta', 'Sprite', 'Water'];

// Admin credentials
const ADMIN_CREDENTIALS = {
  email: 'admin@meatdoctorucc.com',
  password: 'admin123'
};

// Helper function to get data from localStorage
const getLocalStorage = <T>(key: string, defaultValue: T): T => {
  if (typeof window === 'undefined') {
    return defaultValue;
  }
  
  try {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error getting localStorage item ${key}:`, error);
    return defaultValue;
  }
};

// Helper function to set data in localStorage
const setLocalStorage = <T>(key: string, value: T): void => {
  if (typeof window === 'undefined') {
    return;
  }
  
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error setting localStorage item ${key}:`, error);
  }
};

// Generate a random order ID
export const generateOrderId = (): string => {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `MD${timestamp}${random}`;
};

// Food management
export const getFoods = (): Food[] => {
  return getLocalStorage<Food[]>('foods', [
    {
      id: 1,
      name: 'Jollof Rice with Chicken',
      price: 25,
      description: 'Spicy jollof rice served with grilled chicken and vegetables',
      imageUrl: 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
    },
    {
      id: 2,
      name: 'Banku with Tilapia',
      price: 30,
      description: 'Traditional banku served with grilled tilapia and hot pepper sauce',
      imageUrl: 'https://images.unsplash.com/photo-1604909052743-94e838986d24?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
    },
    {
      id: 3,
      name: 'Waakye',
      price: 20,
      description: 'Rice and beans dish served with spaghetti, fish, and spicy sauce',
      imageUrl: 'https://images.unsplash.com/photo-1576506295286-5cda18df9ef1?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
    }
  ]);
};

export const saveFood = (food: Food): Food => {
  const foods = getFoods();
  
  if (food.id) {
    // Update existing food
    const index = foods.findIndex(f => f.id === food.id);
    if (index !== -1) {
      foods[index] = food;
      setLocalStorage('foods', foods);
      return food;
    }
  }
  
  // Add new food
  const newFood = {
    ...food,
    id: Math.max(0, ...foods.map(f => f.id)) + 1
  };
  
  foods.push(newFood);
  setLocalStorage('foods', foods);
  return newFood;
};

export const deleteFood = (id: number): boolean => {
  const foods = getFoods();
  const filteredFoods = foods.filter(f => f.id !== id);
  
  if (filteredFoods.length !== foods.length) {
    setLocalStorage('foods', filteredFoods);
    return true;
  }
  
  return false;
};

// Location management
export const getLocations = (): Location[] => {
  return getLocalStorage<Location[]>('locations', [
    { id: 1, name: 'Science', description: 'Science Hostel and vicinity', active: true },
    { id: 2, name: 'Casford', description: 'Casford Hostel and surrounding areas', active: true },
    { id: 3, name: 'Amamoma', description: 'Amamoma township and surroundings', active: true },
    { id: 4, name: 'SRC Hostel', description: 'SRC Hostel and surrounding areas', active: true }
  ]);
};

export const saveLocation = (location: Location): Location => {
  const locations = getLocations();
  
  if (location.id) {
    // Update existing location
    const index = locations.findIndex(l => l.id === location.id);
    if (index !== -1) {
      locations[index] = location;
      setLocalStorage('locations', locations);
      return location;
    }
  }
  
  // Add new location
  const newLocation = {
    ...location,
    id: Math.max(0, ...locations.map(l => l.id)) + 1
  };
  
  locations.push(newLocation);
  setLocalStorage('locations', locations);
  return newLocation;
};

export const deleteLocation = (id: number): boolean => {
  const locations = getLocations();
  const filteredLocations = locations.filter(l => l.id !== id);
  
  if (filteredLocations.length !== locations.length) {
    setLocalStorage('locations', filteredLocations);
    return true;
  }
  
  return false;
};

// Payment mode management
export const getPaymentModes = (): PaymentMode[] => {
  return getLocalStorage<PaymentMode[]>('paymentModes', [
    { id: 1, name: 'Mobile Money', description: 'Pay with MTN, Vodafone or AirtelTigo Mobile Money', active: true },
    { id: 2, name: 'Cash on Delivery', description: 'Pay with cash when your order is delivered', active: true },
    { id: 3, name: 'Bank Transfer', description: 'Pay via bank transfer', active: false }
  ]);
};

export const savePaymentMode = (paymentMode: PaymentMode): PaymentMode => {
  const paymentModes = getPaymentModes();
  
  if (paymentMode.id) {
    // Update existing payment mode
    const index = paymentModes.findIndex(p => p.id === paymentMode.id);
    if (index !== -1) {
      paymentModes[index] = paymentMode;
      setLocalStorage('paymentModes', paymentModes);
      return paymentMode;
    }
  }
  
  // Add new payment mode
  const newPaymentMode = {
    ...paymentMode,
    id: Math.max(0, ...paymentModes.map(p => p.id)) + 1
  };
  
  paymentModes.push(newPaymentMode);
  setLocalStorage('paymentModes', paymentModes);
  return newPaymentMode;
};

export const deletePaymentMode = (id: number): boolean => {
  const paymentModes = getPaymentModes();
  const filteredPaymentModes = paymentModes.filter(p => p.id !== id);
  
  if (filteredPaymentModes.length !== paymentModes.length) {
    setLocalStorage('paymentModes', filteredPaymentModes);
    return true;
  }
  
  return false;
};

// Booking management
export const getBookings = (): Booking[] => {
  return getLocalStorage<Booking[]>('bookings', []);
};

export const saveBooking = (booking: Booking): void => {
  const bookings = getBookings();
  bookings.unshift(booking); // Add to the beginning of the array
  setLocalStorage('bookings', bookings);
};

export const updateBooking = (id: string, updates: Partial<Booking>): boolean => {
  const bookings = getBookings();
  const index = bookings.findIndex(b => b.id === id);
  
  if (index !== -1) {
    bookings[index] = { ...bookings[index], ...updates };
    setLocalStorage('bookings', bookings);
    return true;
  }
  
  return false;
};

export const deleteBooking = (id: string): boolean => {
  const bookings = getBookings();
  const filteredBookings = bookings.filter(b => b.id !== id);
  
  if (filteredBookings.length !== bookings.length) {
    setLocalStorage('bookings', filteredBookings);
    return true;
  }
  
  return false;
};

// Analytics
export const getAnalytics = (): Analytics => {
  const bookings = getBookings();
  
  // Calculate total bookings
  const totalBookings = bookings.length;
  
  // Calculate total revenue
  const totalRevenue = bookings.reduce((total, booking) => {
    return total + (booking.food.price * booking.quantity);
  }, 0);
  
  // Count bookings by status
  const statusCounts = bookings.reduce((counts, booking) => {
    counts[booking.status] = (counts[booking.status] || 0) + 1;
    return counts;
  }, {} as Record<string, number>);
  
  // Count popular foods
  const foodCounts = bookings.reduce((counts, booking) => {
    const foodName = booking.food.name;
    counts[foodName] = (counts[foodName] || 0) + booking.quantity;
    return counts;
  }, {} as Record<string, number>);
  
  const popularFoods = Object.entries(foodCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
  
  return {
    totalBookings,
    totalRevenue,
    statusCounts,
    popularFoods
  };
};

// Admin authentication
export const verifyAdminCredentials = (email: string, password: string): boolean => {
  return email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password;
};

export const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const verifyOTP = (otp: string): boolean => {
  const savedOTP = window.localStorage.getItem('adminOTP');
  const savedOTPExpiry = window.localStorage.getItem('adminOTPExpiry');
  
  if (!savedOTP || !savedOTPExpiry) return false;
  
  if (Number(savedOTPExpiry) < Date.now()) {
    // OTP expired
    window.localStorage.removeItem('adminOTP');
    window.localStorage.removeItem('adminOTPExpiry');
    return false;
  }
  
  return savedOTP === otp;
};

export const saveOTPToStorage = (otp: string): void => {
  // OTP valid for 10 minutes
  const expiryTime = Date.now() + 10 * 60 * 1000;
  window.localStorage.setItem('adminOTP', otp);
  window.localStorage.setItem('adminOTPExpiry', expiryTime.toString());
};

export const setAdminSession = (): void => {
  const expiryTime = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
  window.localStorage.setItem('adminToken', 'admin-session-token');
  window.localStorage.setItem('tokenExpiry', expiryTime.toString());
};

export const clearAdminSession = (): void => {
  window.localStorage.removeItem('adminToken');
  window.localStorage.removeItem('tokenExpiry');
  window.localStorage.removeItem('adminOTP');
  window.localStorage.removeItem('adminOTPExpiry');
};

// Site settings
export const getSiteSettings = (): SiteSettings | null => {
  return getLocalStorage<SiteSettings | null>('siteSettings', null);
};

export const updateSiteSettings = (settings: SiteSettings): void => {
  setLocalStorage('siteSettings', settings);
};
