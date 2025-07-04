
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const errorMiddleware = require('./middleware/errorMiddleware');
const authRoutes = require('./routes/authRoutes');
const foodRoutes = require('./routes/foodRoutes');
const orderRoutes = require('./routes/orderRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
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

// Enable CORS for your frontend origins
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:8080',
    'https://meatdoctorucc.netlify.app'
  ],
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

// Health check endpoint for OpenShift
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Readiness probe endpoint
app.get('/ready', async (req, res) => {
  try {
    // Test database connection
    const { data, error } = await supabase.from('admins').select('count').limit(1);
    if (error) {
      logger.error('Database connection failed:', error);
      return res.status(503).json({ status: 'not ready', error: 'Database connection failed' });
    }
    res.status(200).json({ status: 'ready', timestamp: new Date().toISOString() });
  } catch (err) {
    logger.error('Readiness check failed:', err);
    res.status(503).json({ status: 'not ready', error: err.message });
  }
});

// Routes
app.use('/api', settingsRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/foods', foodRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
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

// OpenShift uses PORT environment variable, default to 8080 for OpenShift compatibility
const PORT = process.env.PORT || 8080;
const HOST = process.env.HOST || '0.0.0.0';

app.listen(PORT, HOST, () => {
  logger.info(`Server running on ${HOST}:${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;
