export interface SiteSettings {
    site_name: string;
    site_description: string;
    contact_email: string;
    contact_phone: string;
    contact_address: string;
    background_image_url: string;
    dark_mode_enabled: boolean;
    notifications_enabled: boolean;
    footer_text: string;
    email_settings?: Record<string, any> | null; // Added to match backend
    sms_settings?: Record<string, any> | null;   // Added to match backend
  }
  
  export interface Food {
    id: string;
    name: string;
    price: number;
    image_urls?: string[];
    is_available: boolean;
    category_id?: string;
    categories?: {
      name: string;
    };
  }
  
  export interface Booking {
    id: string;
    order_id?: string; // Added for detailed data
    food: Food;
    food_id: string;
    quantity: number;
    delivery_location: string;
    phone_number: string;
    delivery_time: string;
    payment_mode: string;
    drink?: string;
    additional_notes?: string;
    addons?: string[];
    order_status: string; // Updated to match database field
    created_at: string;
  }
  
  export interface DetailedOrder {
    order_id: string;
    quantity: number;
    delivery_location: string;
    order_status: string;
    created_at: string;
    food_name?: string; // For location data
  }
  
  export interface DetailedFoodData {
    name: string;
    count: number;
    totalRevenue: number;
    orders: DetailedOrder[];
  }
  
  export interface DetailedCategoryData {
    name: string;
    count: number;
    totalRevenue: number;
    orders: DetailedOrder[];
  }
  
  export interface DetailedLocationData {
    name: string;
    count: number;
    totalRevenue: number;
    orders: DetailedOrder[];
  }
  
  export interface Analytics {
    totalBookings: number;
    totalRevenue: number;
    statusCounts: Record<string, number>;
    popularFoods: { name: string; count: number }[];
    popularCategories: { name: string; count: number }[];
    topLocations: { name: string; count: number }[];
    paymentModes: { name: string; count: number }[];
    drinkPreferences: { name: string; count: number }[];
    ordersByDay: { date: string; count: number }[];
    detailedFoodData: DetailedFoodData[];
    detailedCategoryData: DetailedCategoryData[];
    detailedLocationData: DetailedLocationData[];
  }
  
  export interface Location {
    id: string;
    name: string;
    description?: string;
    is_active: boolean;
  }
  
  export interface PaymentMethod {
    id: string;
    name: string;
    description?: string;
    is_active: boolean;
  }