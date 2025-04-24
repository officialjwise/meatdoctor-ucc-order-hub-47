const { supabase } = require('../config/supabase');
const logger = require('../utils/logger');
const path = require('path');

const getFoods = async (req, res) => {
  try {
    if (!supabase) {
      logger.error('Supabase client is not initialized. Check SUPABASE_URL and SUPABASE_SERVICE_KEY in your environment variables.');
      throw new Error('Supabase client is not initialized');
    }

    const { data, error } = await supabase
      .from('foods')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      logger.error(`Error fetching foods: ${error.message}`);
      return res.status(500).json({ message: 'Failed to fetch foods' });
    }

    return res.status(200).json(data);
  } catch (error) {
    logger.error(`Error in getFoods: ${error.message}`);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const createFood = async (req, res) => {
  const { name, price, description, category, image_urls } = req.body;

  if (!name || typeof price !== 'number' || price <= 0) {
    logger.warn('Invalid food data provided');
    return res.status(400).json({ message: 'Name and a valid price are required' });
  }

  try {
    if (!supabase) {
      logger.error('Supabase client is not initialized. Check SUPABASE_URL and SUPABASE_SERVICE_KEY in your environment variables.');
      throw new Error('Supabase client is not initialized');
    }

    const { data, error } = await supabase
      .from('foods')
      .insert([{ 
        name, 
        price, 
        description: description || null, 
        category: category || null, 
        image_urls: image_urls || [], 
        is_available: false 
      }])
      .select();

    if (error) {
      logger.error(`Error adding food: ${error.message}`);
      return res.status(500).json({ message: 'Failed to add food' });
    }

    logger.info(`Food added: ${name}`);
    return res.status(201).json(data[0]);
  } catch (error) {
    logger.error(`Error in createFood: ${error.message}`);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const updateFood = async (req, res) => {
  const { id } = req.params;
  const { name, price, description, category, image_urls, is_available } = req.body;

  if (!name && !price && description === undefined && category === undefined && image_urls === undefined && is_available === undefined) {
    logger.warn('No valid fields provided for update');
    return res.status(400).json({ message: 'At least one field must be provided' });
  }

  const updates = {};
  if (name) updates.name = name;
  if (typeof price === 'number') updates.price = price;
  if (description !== undefined) updates.description = description;
  if (category !== undefined) updates.category = category;
  if (image_urls !== undefined) updates.image_urls = image_urls;
  if (is_available !== undefined) updates.is_available = is_available;

  try {
    if (!supabase) {
      logger.error('Supabase client is not initialized. Check SUPABASE_URL and SUPABASE_SERVICE_KEY in your environment variables.');
      throw new Error('Supabase client is not initialized');
    }

    const { data, error } = await supabase
      .from('foods')
      .update(updates)
      .eq('id', id)
      .select();

    if (error) {
      logger.error(`Error updating food: ${error.message}`);
      return res.status(500).json({ message: 'Failed to update food' });
    }

    if (!data || data.length === 0) {
      logger.warn(`Food not found: ${id}`);
      return res.status(404).json({ message: 'Food not found' });
    }

    logger.info(`Food updated: ${id}`);
    return res.status(200).json(data[0]);
  } catch (error) {
    logger.error(`Error in updateFood: ${error.message}`);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const deleteFood = async (req, res) => {
  const { id } = req.params;

  try {
    if (!supabase) {
      logger.error('Supabase client is not initialized. Check SUPABASE_URL and SUPABASE_SERVICE_KEY in your environment variables.');
      throw new Error('Supabase client is not initialized');
    }

    const { data: food, error: fetchError } = await supabase
      .from('foods')
      .select('id')
      .eq('id', id)
      .single();

    if (fetchError) {
      logger.error(`Error checking food existence: ${fetchError.message}`);
      return res.status(500).json({ message: 'Failed to delete food item' });
    }

    if (!food) {
      logger.warn(`Food not found: ${id}`);
      return res.status(404).json({ message: 'Food not found' });
    }

    const { error: deleteError } = await supabase
      .from('foods')
      .delete()
      .eq('id', id);

    if (deleteError) {
      logger.error(`Error deleting food: ${deleteError.message}`);
      return res.status(500).json({ message: 'Failed to delete food item' });
    }

    logger.info(`Food deleted: ${id}`);
    return res.status(200).json({ message: 'Food deleted successfully' });
  } catch (error) {
    logger.error(`Error in deleteFood: ${error.message}`);
    return res.status(500).json({ message: 'Failed to delete food item' });
  }
};

const uploadFoodImage = async (req, res) => {
  if (!req.files || req.files.length === 0) {
    logger.warn('No image files uploaded');
    return res.status(400).json({ message: 'No image files uploaded' });
  }

  try {
    if (!supabase) {
      logger.error('Supabase client is not initialized. Check SUPABASE_URL and SUPABASE_SERVICE_KEY in your environment variables.');
      throw new Error('Supabase client is not initialized');
    }

    const imageUrls = [];
    for (const file of req.files) {
      const fileName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('food_images')
        .upload(fileName, file.buffer, {
          contentType: file.mimetype,
        });

      if (error) {
        logger.error(`Error uploading image to Supabase Storage: ${error.message}`);
        return res.status(500).json({ message: 'Failed to upload image to storage' });
      }

      // Get the public URL
      const { data: publicUrlData } = supabase.storage
        .from('food_images')
        .getPublicUrl(fileName);

      if (!publicUrlData.publicUrl) {
        logger.error('Failed to generate public URL for uploaded image');
        return res.status(500).json({ message: 'Failed to generate image URL' });
      }

      imageUrls.push(publicUrlData.publicUrl);
      logger.info(`Image uploaded to Supabase Storage: ${publicUrlData.publicUrl}`);
    }

    return res.status(200).json({ imageUrls });
  } catch (error) {
    logger.error(`Error in uploadFoodImage: ${error.message}`);
    return res.status(500).json({ message: 'Failed to upload image' });
  }
};

module.exports = { getFoods, createFood, updateFood, deleteFood, uploadFoodImage };