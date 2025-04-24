const express = require('express');
const {
  createFood,
  updateFood,
  deleteFood,
  getFoods,
  uploadFoodImage,
} = require('../controllers/foodController');
const { authMiddleware } = require('../middleware/authMiddleware');
const { validateFood, validate } = require('../middleware/validateMiddleware');
const multer = require('multer');

const upload = multer({ storage: multer.memoryStorage() });

const router = express.Router();

router.get('/', getFoods);
router.post('/', authMiddleware, validateFood, validate, createFood);
router.put('/:id', authMiddleware, updateFood);
router.delete('/:id', authMiddleware, deleteFood);
//router.post('/upload-image', authMiddleware, upload.single('image'), uploadFoodImage);
router.post('/upload-image', authMiddleware, upload.array('images', 3), uploadFoodImage);
module.exports = router; 