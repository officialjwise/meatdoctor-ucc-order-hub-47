const express = require('express');
const { login, verifyOtp } = require('../controllers/authController');
const { validateLogin, validateOtp, validate } = require('../middleware/validateMiddleware');

const router = express.Router();

router.post('/login', validateLogin, validate, login);
router.post('/verify-otp', validateOtp, validate, verifyOtp);

module.exports = router; 