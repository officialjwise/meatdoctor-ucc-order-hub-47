const express = require('express');
const { updateSettings, getSettings, uploadBackgroundImage } = require('../controllers/settingsController');
const { authMiddleware } = require('../middleware/authMiddleware');
const { validateSettings, validate } = require('../middleware/validateMiddleware');
const multer = require('multer');
const logger = require('../utils/logger');
const supabase = require('../config/supabase');

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

// Public route: Fetch background image, site name, and description
router.get('/public/background-image', async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('settings')
      .select('background_image_url, site_name, site_description')
      .order('created_at', { ascending: true })
      .limit(1)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows exist, return defaults
        return res.status(200).json({
          backgroundImageUrl: null,
          siteName: 'MeatDoctor UCC',
          siteDescription: 'Your favorite food delivery service'
        });
      }
      logger.error(`Supabase error fetching public settings: ${JSON.stringify(error)}`);
      throw new Error('Failed to fetch public settings');
    }

    // Clean up extra rows
    await supabase.from('settings').delete().neq('id', data.id);

    res.status(200).json({
      backgroundImageUrl: data.background_image_url || null,
      siteName: data.site_name || 'MeatDoctor UCC',
      siteDescription: data.site_description || 'Your favorite food delivery service'
    });
  } catch (err) {
    logger.error(`Fetch public settings error: ${err.message}`);
    next(err);
  }
});

// Public route: No authMiddleware
router.get('/', getSettings);

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