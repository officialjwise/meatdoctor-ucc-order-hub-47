const express = require('express');
const { updateSettings, getSettings, uploadBackgroundImage } = require('../controllers/settingsController');
const { authMiddleware } = require('../middleware/authMiddleware');
const { validateSettings, validate } = require('../middleware/validateMiddleware');
const multer = require('multer');
const logger = require('../utils/logger');

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

router.put('/', authMiddleware, validateSettings, validate, updateSettings);
router.get('/', authMiddleware, getSettings);
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