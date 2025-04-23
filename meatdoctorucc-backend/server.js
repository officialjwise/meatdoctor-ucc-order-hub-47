const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const errorMiddleware = require('./middleware/errorMiddleware'); // Import function directly
const authRoutes = require('./routes/authRoutes');
const foodRoutes = require('./routes/foodRoutes');
const orderRoutes = require('./routes/orderRoutes');
const settingsRoutes = require('./routes/settingsRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const logger = require('./utils/logger');
const supabase = require('./config/supabase');

dotenv.config(); // Load .env directly

const app = express();

// Middleware
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:3000' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/foods', foodRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/analytics', analyticsRoutes);

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
app.use(errorMiddleware); // Use function directly

const PORT = process.env.PORT || 6000;
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});