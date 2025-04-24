const express = require('express');
const { updateSettings, getSettings, uploadBackgroundImage } = require('../controllers/settingsController');
const { authMiddleware } = require('../middleware/authMiddleware');
const { validateSettings, validate } = require('../middleware/validateMiddleware');
const multer = require('multer');
const logger = require('../utils/logger');
const { supabase } = require('../config/supabase');

const upload = multer({ storage: multer.memoryStorage() });

// Multer error handling middleware
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    logger.error(`Multer error: ${err.message}`);
    return res.status(400).json({ error: err.message });
  }
  next(err);
};

const router = express.Router();

// Public route: Fetch background image, site name, description, and footer text
router.get('/public/background-image', async (req, res, next) => {
  logger.info(`Received request for /api/public/background-image from ${req.ip}`);
  try {
    if (!supabase) {
      logger.error('Supabase client is not initialized.');
      return res.status(500).json({ message: 'Internal server error: Supabase client not initialized' });
    }

    const { data, error } = await supabase
      .from('settings')
      .select('background_image_url, site_name, site_description, footer_text')
      .order('created_at', { ascending: true })
      .limit(1)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        logger.info('No settings found, returning default values');
        return res.status(200).json({
          backgroundImageUrl: null,
          siteName: 'MeatDoctor UCC',
          siteDescription: 'Your favorite food delivery service',
          footerText: '© 2025 MeatDoctor UCC. All rights reserved.'
        });
      }
      logger.error(`Supabase error fetching public settings: ${JSON.stringify(error)}`);
      return res.status(500).json({ message: 'Failed to fetch public settings' });
    }

    // Clean up extra rows
    await supabase.from('settings').delete().neq('id', data.id);

    logger.info('Successfully fetched public settings');
    res.status(200).json({
      backgroundImageUrl: data.background_image_url || null,
      siteName: data.site_name || 'MeatDoctor UCC',
      siteDescription: data.site_description || 'Your favorite food delivery service',
      footerText: data.footer_text || '© 2025 MeatDoctor UCC. All rights reserved.'
    });
  } catch (err) {
    logger.error(`Fetch public settings error: ${err.message}`, { stack: err.stack });
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Authenticated route: Fetch full settings
router.get('/', authMiddleware, getSettings);

// Authenticated routes
router.put('/', authMiddleware, validateSettings, validate, updateSettings);
router.post(
  '/upload-background',
  authMiddleware,
  (req, res, next) => {
    upload.single('image')(req, res, (err) => {
      if (err) return handleMulterError(err, req, res, next);
      next();
    });
  },
  uploadBackgroundImage
);

module.exports = router;