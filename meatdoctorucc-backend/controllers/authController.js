const { supabase } = require('../config/supabase');
const { sendEmail } = require('../utils/sendEmail');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { generateOTP } = require('../utils/generateOTP');
const logger = require('../utils/logger');

const login = async (req, res, next) => {
  try {
    if (!supabase) {
      logger.error('Supabase client is not initialized. Check SUPABASE_URL and SUPABASE_SERVICE_KEY in your environment variables.');
      throw new Error('Supabase client is not initialized');
    }

    const { email, password } = req.body;
    logger.info(`Login attempt for: ${email}`);
    if (!email || !password) throw new Error('Email and password are required');

    // Verify admin
    const { data: admin, error: adminError } = await supabase
      .from('admins')
      .select('id, email, password_hash')
      .eq('email', email.trim().toLowerCase()) // Normalize email
      .single();

    logger.info(`Supabase query result: admin=${JSON.stringify(admin)}, error=${JSON.stringify(adminError)}`);

    if (adminError || !admin) {
      logger.error(`No admin found or query error: ${adminError ? adminError.message : 'No admin'}`);
      throw new Error('Invalid credentials');
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, admin.password_hash);
    logger.info(`Password match: ${isMatch}`);

    if (!isMatch) {
      logger.error(`Password mismatch for: ${email}`);
      throw new Error('Invalid credentials');
    }

    // Generate and store OTP
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    const { error: otpError } = await supabase
      .from('otp_tokens')
      .insert([{ email, otp, expires_at: expiresAt }]);

    if (otpError) {
      logger.error(`Failed to store OTP: ${otpError.message}`);
      throw new Error('Failed to generate OTP');
    }

    // Send OTP via email or log to console
    await sendEmail({
      to: email,
      subject: 'Your OTP for MeatDoctorUcc Admin Login',
      text: `Your OTP is ${otp}. It expires in 10 minutes.`,
    });

    res.status(200).json({ message: 'OTP sent to email or logged to console' });
  } catch (err) {
    logger.error(`Login error: ${err.message}`);
    next(err);
  }
};

const verifyOtp = async (req, res, next) => {
  try {
    if (!supabase) {
      logger.error('Supabase client is not initialized. Check SUPABASE_URL and SUPABASE_SERVICE_KEY in your environment variables.');
      throw new Error('Supabase client is not initialized');
    }

    const { email, otp } = req.body;
    if (!email || !otp) throw new Error('Email and OTP are required');

    // Verify OTP
    const { data: token, error: tokenError } = await supabase
      .from('otp_tokens')
      .select('*')
      .eq('email', email)
      .eq('otp', otp)
      .gte('expires_at', new Date().toISOString())
      .single();

    if (tokenError || !token) throw new Error('Invalid or expired OTP');

    // Delete used OTP
    await supabase.from('otp_tokens').delete().eq('id', token.id);

    // Generate JWT
    const jwtToken = jwt.sign({ userId: token.email, role: 'admin' }, process.env.JWT_SECRET, {
      expiresIn: '30m',
    });

    res.status(200).json({ token: jwtToken });
  } catch (err) {
    next(err);
  }
};

module.exports = { login, verifyOtp };