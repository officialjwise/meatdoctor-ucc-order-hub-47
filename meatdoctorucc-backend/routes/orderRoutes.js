const express = require('express');
const { createOrder, updateOrder, getOrders, deleteOrder, trackOrder } = require('../controllers/orderController');
const { authMiddleware } = require('../middleware/authMiddleware');
const { validateOrder, validate } = require('../middleware/validateMiddleware');

const router = express.Router();

router.post('/', validateOrder, validate, createOrder);
router.get('/', authMiddleware, getOrders);
router.put('/:id', authMiddleware, updateOrder);
router.delete('/:id', authMiddleware, deleteOrder);
router.get('/track/:orderId', trackOrder);

module.exports = router;