const express = require('express');
const { getLocations, createLocation, updateLocation } = require('../controllers/locationController');
const { authMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();

// Get all locations (public route for now, can add authMiddleware if needed)
router.get('/', getLocations);

// Add a new location (admin only)
router.post('/', authMiddleware, createLocation);

// Update a location (admin only)
router.put('/:id', authMiddleware, updateLocation);

module.exports = router;