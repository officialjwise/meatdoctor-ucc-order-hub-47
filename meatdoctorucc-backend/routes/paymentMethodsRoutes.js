const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validateMiddleware');
const { check } = require('express-validator');
const {
  getPaymentMethods,
  getPublicPaymentModes,
  createPaymentMethod,
  updatePaymentMethod,
  deletePaymentMethod,
} = require('../controllers/paymentMethodController');
const logger = require('../utils/logger');

// Validation middleware for creating/updating payment methods
const validatePaymentMethod = [
  check('name').notEmpty().withMessage('Payment method name is required'),
  check('is_active').optional().isBoolean().withMessage('Active status must be a boolean'),
  check('description').optional().isString().withMessage('Description must be a string'), // Added validation for description
];

// Public route: Fetch active payment modes (no authentication required)
router.get('/public/payment-modes', getPublicPaymentModes);

// Authenticated routes
router.get('/', authMiddleware, getPaymentMethods); // Fetch all payment methods
router.post('/', authMiddleware, validatePaymentMethod, validate, createPaymentMethod); // Create a new payment method
router.put('/:id', authMiddleware, validatePaymentMethod, validate, updatePaymentMethod); // Update a payment method
router.delete('/:id', authMiddleware, deletePaymentMethod); // Delete a payment method

module.exports = router;