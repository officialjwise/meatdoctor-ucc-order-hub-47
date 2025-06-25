
const express = require('express');
const router = express.Router();
const { verifyPaystackPayment } = require('../controllers/paymentController');

router.post('/verify-payment', verifyPaystackPayment);

module.exports = router;
