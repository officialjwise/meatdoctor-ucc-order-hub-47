
const express = require('express');
const { createOrder, updateOrder, getOrders, deleteOrder, trackOrder } = require('../controllers/orderController');
const { authMiddleware } = require('../middleware/authMiddleware');
const { validateOrder, validate } = require('../middleware/validateMiddleware');
const { sendSMS } = require('../utils/sendSMS');

const router = express.Router();

router.post('/', validateOrder, validate, createOrder);
router.get('/', authMiddleware, getOrders);
router.put('/:id', authMiddleware, updateOrder);
router.delete('/:id', authMiddleware, deleteOrder);
router.get('/track/:orderId', trackOrder);

// SMS endpoint for status updates
router.post('/send-sms', authMiddleware, async (req, res) => {
  try {
    const { to, message } = req.body;
    
    await sendSMS({
      to,
      content: message,
    });
    
    res.status(200).json({ success: true, message: 'SMS sent successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to send SMS' });
  }
});

module.exports = router;
