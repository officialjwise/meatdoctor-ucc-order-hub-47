const express = require('express');
const { supabase } = require('../config/supabase');
const logger = require('../utils/logger');

const router = express.Router();

// Public route: Fetch available foods
router.get('/foods', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('foods')
      .select(`
        *,
        categories!foods_category_id_fkey (name)
      `)
      .eq('is_available', true)
      .order('created_at', { ascending: false });

    if (error) {
      logger.error(`Error fetching public foods: ${error.message}`);
      return res.status(500).json({ message: 'Failed to fetch foods' });
    }

    const normalizedData = data.map(food => ({
      ...food,
      category: food.categories?.name || null,
      additional_option_ids: food.additional_option_ids || [],
      image_urls: food.image_urls || [],
    }));

    logger.info(`Successfully fetched ${normalizedData.length} public foods`);
    return res.status(200).json(normalizedData);
  } catch (error) {
    logger.error(`Error in get public foods: ${error.message}`, { stack: error.stack });
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Public route: Fetch active locations
router.get('/locations', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('locations')
      .select('id, name, is_active')
      .eq('is_active', true)
      .order('name', { ascending: true });

    if (error) {
      logger.error(`Error fetching public locations: ${error.message}`);
      return res.status(500).json({ message: 'Failed to fetch locations' });
    }

    logger.info(`Successfully fetched ${data.length} public locations`);
    return res.status(200).json(data);
  } catch (error) {
    logger.error(`Error in get public locations: ${error.message}`, { stack: error.stack });
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Public route: Fetch payment modes
router.get('/payment-modes', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('payment_methods')
      .select('id, name, is_active')
      .eq('is_active', true)
      .order('name', { ascending: true });

    if (error) {
      logger.error(`Error fetching public payment modes: ${error.message}`);
      return res.status(500).json({ message: 'Failed to fetch payment modes' });
    }

    logger.info(`Successfully fetched ${data.length} public payment modes`);
    return res.status(200).json(data);
  } catch (error) {
    logger.error(`Error in get public payment modes: ${error.message}`, { stack: error.stack });
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Public route: Fetch additional options (e.g., drinks)
router.get('/additional-options', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('additional_options')
      .select('id, name, type, price')
      .order('name', { ascending: true });

    if (error) {
      logger.error(`Error fetching public additional options: ${error.message}`);
      return res.status(500).json({ message: 'Failed to fetch additional options' });
    }

    logger.info(`Successfully fetched ${data.length} public additional options`);
    return res.status(200).json(data);
  } catch (error) {
    logger.error(`Error in get public additional options: ${error.message}`, { stack: error.stack });
    return res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;