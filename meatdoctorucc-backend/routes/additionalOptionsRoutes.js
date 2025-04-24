const express = require('express');
const { getAdditionalOptions, createAdditionalOption, updateAdditionalOption, deleteAdditionalOption } = require('../controllers/additionalOptionsController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', authMiddleware, getAdditionalOptions);
router.post('/', authMiddleware, createAdditionalOption);
router.put('/:id', authMiddleware, updateAdditionalOption);
router.delete('/:id', authMiddleware, deleteAdditionalOption);

module.exports = router;