const express = require('express');
const { authMiddleware } = require('../middleware/authMiddleware');
const {
  getFoods,
  getPublicFoods,
  createFood,
  updateFood,
  deleteFood,
  uploadFoodImage,
} = require('../controllers/foodController');
const multer = require('multer');
const logger = require('../utils/logger');

// Multer setup for image uploads
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

// Public route: Fetch available foods (no authentication required)
router.get('/public/foods', getPublicFoods);

// Authenticated routes
router.get('/', authMiddleware, getFoods);
router.post(
  '/',
  authMiddleware,
  (req, res, next) => {
    upload.array('images')(req, res, (err) => {
      if (err) return handleMulterError(err, req, res, next);
      next();
    });
  },
  createFood
);
router.put('/:id', authMiddleware, updateFood);
router.delete('/:id', authMiddleware, deleteFood);
router.post(
  '/:id/upload-image',
  authMiddleware,
  (req, res, next) => {
    upload.array('images')(req, res, (err) => {
      if (err) return handleMulterError(err, req, res, next);
      next();
    });
  },
  uploadFoodImage
);

module.exports = router;