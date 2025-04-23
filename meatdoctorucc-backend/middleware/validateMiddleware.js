const { check, validationResult } = require('express-validator');

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
  check('foodId').notEmpty().withMessage('Food ID is required'),
  check('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  check('deliveryLocation').notEmpty().withMessage('Delivery location is required'),
  check('phoneNumber').matches(/^\+233\d{9}$/).withMessage('Phone number must be in +233 format'),
  check('deliveryTime').isISO8601().withMessage('Delivery time must be a valid ISO date'),
  check('paymentMode').isIn(['Mobile Money', 'Cash']).withMessage('Invalid payment mode'),
];

const validateSettings = [
  check('emailSettings').optional().isObject().withMessage('Email settings must be an object'),
  check('smsSettings').optional().isObject().withMessage('SMS settings must be an object'),
  check('backgroundImageUrl').optional().isURL().withMessage('Background image URL must be valid'),
];

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

module.exports = { validateLogin, validateOtp, validateFood, validateOrder, validateSettings, validate };