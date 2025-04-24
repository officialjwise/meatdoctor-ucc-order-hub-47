const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validateMiddleware');
const { check } = require('express-validator');
const {
  getLocations,
  getPublicLocations,
  createLocation,
  updateLocation,
  deleteLocation,
} = require('../controllers/locationController');
const logger = require('../utils/logger');

// Validation middleware for creating/updating locations
const validateLocation = [
  check('name').notEmpty().withMessage('Location name is required'),
  check('is_active').optional().isBoolean().withMessage('Active status must be a boolean'), // Updated to is_active
  check('description').optional().isString().withMessage('Description must be a string'), // Added validation for description
];

// Public route: Fetch active locations (no authentication required)
router.get('/public/locations', getPublicLocations);

// Authenticated routes
router.get('/', authMiddleware, getLocations); // Fetch all locations
router.post('/', authMiddleware, validateLocation, validate, createLocation); // Create a new location
router.put('/:id', authMiddleware, validateLocation, validate, updateLocation); // Update a location
router.delete('/:id', authMiddleware, deleteLocation); // Delete a location

module.exports = router;