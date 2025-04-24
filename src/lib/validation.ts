export interface BookingFormData {
  foodId: string; // Changed from number to string
  price: number;
  quantity: number;
  addons?: string[];
  paymentMode: string;
  location: string;
  additionalInfo: string;
  phoneNumber: string;
  deliveryTime: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: Record<string, string>;
}

export const formatGhanaPhone = (phone: string): string => {
  phone = phone.replace(/\s+/g, '');
  if (!phone.startsWith('+233')) {
    if (phone.startsWith('0')) {
      phone = '+233' + phone.slice(1);
    } else {
      phone = '+233' + phone;
    }
  }
  return phone;
};

export const validateBookingForm = (data: BookingFormData): ValidationResult => {
  const errors: Record<string, string> = {};
  let valid = true;

  // Validate foodId
  if (!data.foodId || data.foodId === '') { // Updated for string
    errors.foodId = 'Please select a food item';
    valid = false;
  }

  // Validate price
  if (!data.price || data.price <= 0) {
    errors.price = 'Price is required';
    valid = false;
  }

  // Validate quantity
  if (!data.quantity || data.quantity < 1 || data.quantity > 10) {
    errors.quantity = 'Quantity must be between 1 and 10';
    valid = false;
  }

  // Validate paymentMode
  if (!data.paymentMode) {
    errors.paymentMode = 'Please select a payment mode';
    valid = false;
  }

  // Validate location
  if (!data.location || data.location === 'no-locations') {
    errors.location = 'Please select a delivery location';
    valid = false;
  }

  // Validate phoneNumber
  const phoneRegex = /^\+233\d{9}$/;
  if (!data.phoneNumber || !phoneRegex.test(formatGhanaPhone(data.phoneNumber))) {
    errors.phoneNumber = 'Please enter a valid Ghana phone number (e.g., +233 XX XXX XXXX)';
    valid = false;
  }

  // Validate deliveryTime
  if (!data.deliveryTime) {
    errors.deliveryTime = 'Please select a delivery time';
    valid = false;
  } else {
    const deliveryDate = new Date(data.deliveryTime);
    const now = new Date();
    if (deliveryDate <= now) {
      errors.deliveryTime = 'Delivery time must be in the future';
      valid = false;
    }
  }

  return { valid, errors };
};