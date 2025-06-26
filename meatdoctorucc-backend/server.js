
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
    'https://meatdoctorucc.netlify.app',
    'http://localhost:3000',
    'http://localhost:5173'
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

// Health check endpoint for OpenShift (must be first)
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    port: process.env.PORT || 8080,
    node_env: process.env.NODE_ENV || 'development'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.status(200).json({ 
    message: 'MeatDoctor UCC Backend API',
    status: 'running',
    timestamp: new Date().toISOString()
  });
});

// Initialize Supabase connection only if environment variables are available
let supabase = null;
try {
  if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_KEY) {
    const { supabase: supabaseClient } = require('./config/supabase');
    supabase = supabaseClient;
    logger.info('Supabase connection initialized');
  } else {
    logger.warn('Supabase environment variables not found, running without database');
  }
} catch (error) {
  logger.error('Failed to initialize Supabase:', error.message);
}

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

// Test endpoint that doesn't require Supabase
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'Backend is working!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Supabase test endpoint (only if Supabase is available)
app.get('/api/test-supabase', async (req, res) => {
  if (!supabase) {
    return res.status(503).json({ error: 'Supabase not configured' });
  }
  
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
  logger.info(`Health check available at: http://${HOST}:${PORT}/health`);
});

module.exports = app;
