const express = require('express');
const { authMiddleware } = require('../middleware/authMiddleware');
const { supabase } = require('../config/supabase');
const logger = require('../utils/logger');
const {
  getAdditionalOptions,
  getPublicAdditionalOptions,
  createAdditionalOption,
  updateAdditionalOption,
  deleteAdditionalOption,
} = require('../controllers/additionalOptionsController'); // Adjust path if needed

const router = express.Router();

// Public route: Fetch additional options (no authentication required)
router.get('/public/additional-options', getPublicAdditionalOptions);

// Authenticated routes
router.get('/', authMiddleware, getAdditionalOptions);

// Add new additional option
router.post('/', authMiddleware, createAdditionalOption);

// Update an existing additional option
router.put('/:id', authMiddleware, updateAdditionalOption);

// Delete an additional option
router.delete('/:id', authMiddleware, deleteAdditionalOption);

module.exports = router;