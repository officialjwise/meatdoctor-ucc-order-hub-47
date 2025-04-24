const { check, validationResult } = require('express-validator');
const { supabase } = require('../config/supabase');
const logger = require('../utils/logger');

// Custom validator to check if paymentMode is an active payment method
const checkPaymentMode = check('paymentMode').custom(async (value) => {
  try {
    const { data, error } = await supabase
      .from('payment_methods')
      .select('name')
      .eq('is_active', true);

    if (error) {
      logger.error(`Error fetching payment methods for validation: ${error.message}`);
      throw new Error('Failed to validate payment mode');
    }

    const activePaymentModes = data.map(mode => mode.name);
    if (!activePaymentModes.includes(value)) {
      throw new Error(`Invalid payment mode. Must be one of: ${activePaymentModes.join(', ')}`);
    }

    return true;
  } catch (err) {
    throw new Error(err.message || 'Failed to validate payment mode');
  }
});

const validateLogin = [
  check('email').isEmail().withMessage('Invalid email'),
  check('password').notEmpty().withMessage('Password is required'),
];

const validateOtp = [
  check('email').isEmail().withMessage('Invalid email'),
  check('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits'),
];

const validateFood = [
  check('name').notEmpty().withMessage('Name is required'),
  check('price').isInt({ min: 0 }).withMessage('Price must be a positive integer'),
];

const validateOrder = [
  check('foodId').notEmpty().withMessage('Food ID is required').isUUID().withMessage('Food ID must be a valid UUID'),
  check('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  check('deliveryLocation').notEmpty().withMessage('Delivery location is required'),
  check('phoneNumber').matches(/^\+233\d{9}$/).withMessage('Phone number must be in +233 format'),
  check('deliveryTime').isISO8601().withMessage('Delivery time must be a valid ISO date'),
  checkPaymentMode, // Use dynamic validation
  check('addons').optional().isArray().withMessage('Addons must be an array'),
  check('addons.*').optional().isString().withMessage('Each addon must be a string'),
];

const validateSettings = [
  check('emailSettings').optional().isObject().withMessage('Email settings must be an object'),
  check('smsSettings').optional().isObject().withMessage('SMS settings must be an object'),
  check('backgroundImageUrl').optional().isURL().withMessage('Background image URL must be valid'),
];

// Middleware to handle validation results
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log('Validation errors:', errors.array());
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

module.exports = {
  validateLogin,
  validateOtp,
  validateFood,
  validateOrder,
  validateSettings,
  validate,
};