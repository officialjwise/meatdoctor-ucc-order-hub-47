
// Form validation utilities

// Validate Ghanaian phone number
export const isValidGhanaPhone = (phone: string): boolean => {
  // Remove spaces and any other non-digit characters except +
  const cleanPhone = phone.replace(/[^0-9+]/g, '');
  
  // Validate Ghana phone formats: +233XXXXXXXXX or 0XXXXXXXXX
  const ghanaRegex = /^(?:\+233|0)\d{9}$/;
  return ghanaRegex.test(cleanPhone);
};

// Format phone to +233 format
export const formatGhanaPhone = (phone: string): string => {
  const cleanPhone = phone.replace(/[^0-9+]/g, '');
  
  if (cleanPhone.startsWith('0')) {
    return '+233' + cleanPhone.substring(1);
  }
  
  if (cleanPhone.startsWith('+233')) {
    return cleanPhone;
  }
  
  return cleanPhone; // Return as is if it doesn't match expected formats
};

// Validate that the food price matches the expected price
export const validateFoodPrice = (foodId: number, price: number): boolean => {
  const foodPrices: Record<number, number> = {
    1: 50, // Assorted Fried Rice with Beef and Fries
    2: 45, // Assorted Fried Rice with Chicken and Fries
    3: 30, // Assorted Jollof Rice with Chicken
    4: 25, // Jollof Rice with Beef and Goat
    5: 20  // Jollof Rice with Grilled Pork and Fried Chicken
  };
  
  return foodPrices[foodId] === price;
};

// Validate quantity (should be between 1 and 10)
export const isValidQuantity = (quantity: number): boolean => {
  return quantity >= 1 && quantity <= 10 && Number.isInteger(quantity);
};

// Validate booking form
export interface BookingFormData {
  foodId: number;
  price: number;
  quantity: number;
  drink: string | null;
  paymentMode: 'Mobile Money' | 'Cash';
  location: string;
  additionalInfo: string;
  phoneNumber: string;
  deliveryTime: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: Record<string, string>;
}

export const validateBookingForm = (data: BookingFormData): ValidationResult => {
  const errors: Record<string, string> = {};
  
  // Validate food selection
  if (!data.foodId) {
    errors.foodId = 'Please select a food item';
  }
  
  // Validate price
  if (!data.price) {
    errors.price = 'Price is required';
  } else if (!validateFoodPrice(data.foodId, data.price)) {
    errors.price = 'Price does not match the selected food';
  }
  
  // Validate quantity
  if (!data.quantity) {
    errors.quantity = 'Quantity is required';
  } else if (!isValidQuantity(data.quantity)) {
    errors.quantity = 'Quantity must be between 1 and 10';
  }
  
  // Validate payment mode
  if (!data.paymentMode) {
    errors.paymentMode = 'Payment mode is required';
  }
  
  // Validate location
  if (!data.location) {
    errors.location = 'Please select a location';
  }
  
  // Validate phone number
  if (!data.phoneNumber) {
    errors.phoneNumber = 'Phone number is required';
  } else if (!isValidGhanaPhone(data.phoneNumber)) {
    errors.phoneNumber = 'Please enter a valid Ghanaian phone number (e.g., +233xxxxxxxxx or 0xxxxxxxxx)';
  }
  
  // Validate delivery time
  if (!data.deliveryTime) {
    errors.deliveryTime = 'Delivery time is required';
  }
  
  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
};
