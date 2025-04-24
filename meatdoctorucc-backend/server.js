const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const errorMiddleware = require('./middleware/errorMiddleware');
const authRoutes = require('./routes/authRoutes');
const foodRoutes = require('./routes/foodRoutes');
const orderRoutes = require('./routes/orderRoutes');
const settingsRoutes = require('./routes/settingsRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const logger = require('./utils/logger');
const { supabase } = require('./config/supabase');
const locationsRoutes = require('./routes/locationsRoutes');
const paymentMethodsRoutes = require('./routes/paymentMethodsRoutes');
const categoriesRoutes = require('./routes/categoriesRoutes');
const additionalOptionsRoutes = require('./routes/additionalOptionsRoutes');
const publicRoutes = require('./routes/publicRoutes');

dotenv.config();

const app = express();

// Enable CORS for your frontend origin
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

// Routes
app.use('/api', settingsRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/foods', foodRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/locations', locationsRoutes);
app.use('/api/payment-methods', paymentMethodsRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/additional-options', additionalOptionsRoutes);
app.use('/api/public', publicRoutes);


app.get('/api/test-supabase', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('admins')
      .select('*')
      .eq('email', 'officialjwise20@gmail.com')
      .single();
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    res.json({ admin: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Error Handling
app.use(errorMiddleware);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});

module.exports = app;