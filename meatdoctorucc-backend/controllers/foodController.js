const { supabase } = require('../config/supabase');
const logger = require('../utils/logger');
const path = require('path');

const getFoods = async (req, res) => {
  try {
    if (!supabase) {
      logger.error('Supabase client is not initialized. Check SUPABASE_URL and SUPABASE_SERVICE_KEY in your environment variables.');
      return res.status(500).json({ message: 'Internal server error: Supabase client not initialized' });
    }

    const { data, error } = await supabase
      .from('foods')
      .select(`
        *,
        categories!foods_category_id_fkey (name)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      logger.error(`Error fetching foods: ${error.message}`);
      return res.status(500).json({ message: 'Failed to fetch foods' });
    }

    const normalizedData = data.map(food => ({
      ...food,
      category: food.categories?.name || null,
      additional_option_ids: food.additional_option_ids || [],
      image_urls: food.image_urls || [],
    }));

    logger.info(`Successfully fetched ${normalizedData.length} foods`);
    return res.status(200).json(normalizedData);
  } catch (error) {
    logger.error(`Error in getFoods: ${error.message}`, { stack: error.stack });
    return res.status(500).json({ message: 'Internal server error' });
  }
};
const getPublicFoods = async (req, res) => {
  try {
    if (!supabase) {
      logger.error('Supabase client is not initialized.');
      throw new Error('Supabase client is not initialized');
    }

    const { data, error } = await supabase
      .from('foods')
      .select(`
        id,
        name,
        price,
        description,
        category_id,
        categories!foods_category_id_fkey (name),
        additional_option_ids,
        image_urls,
        is_available
      `)
      .eq('is_available', true)
      .order('name', { ascending: true });

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

    return res.status(200).json(normalizedData);
  } catch (error) {
    logger.error(`Error in getPublicFoods: ${error.message}`);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const createFood = async (req, res) => {
  const { name, price, description, category_id, additional_option_ids, image_urls, is_available } = req.body;

  if (!name || typeof price !== 'number' || price <= 0) {
    logger.warn('Invalid food data: name and a valid price are required');
    return res.status(400).json({ message: 'Name and a valid price are required' });
  }

  if (category_id) {
    const { data: category, error: categoryError } = await supabase
      .from('categories')
      .select('id')
      .eq('id', category_id)
      .single();

    if (categoryError || !category) {
      logger.warn(`Invalid category_id: ${category_id}`);
      return res.status(400).json({ message: 'Invalid category ID' });
    }
  }

  if (additional_option_ids && additional_option_ids.length > 0) {
    const { data: options, error: optionsError } = await supabase
      .from('additional_options')
      .select('id')
      .in('id', additional_option_ids);

    if (optionsError) {
      logger.error(`Error validating additional_option_ids: ${optionsError.message}`);
      return res.status(500).json({ message: 'Failed to validate additional options' });
    }

    if (options.length !== additional_option_ids.length) {
      logger.warn(`Invalid additional_option_ids: ${additional_option_ids}`);
      return res.status(400).json({ message: 'One or more additional option IDs are invalid' });
    }
  }

  const foodData = {
    name,
    price,
    description: description || null,
    category_id: category_id || null,
    additional_option_ids: additional_option_ids || [],
    image_urls: image_urls || [],
    is_available: is_available || false,
  };

  try {
    if (!supabase) {
      logger.error('Supabase client is not initialized. Check SUPABASE_URL and SUPABASE_SERVICE_KEY in your environment variables.');
      throw new Error('Supabase client is not initialized');
    }

    const { data, error } = await supabase
      .from('foods')
      .insert([foodData])
      .select(`
        *,
        categories!foods_category_id_fkey (name)
      `);

    if (error) {
      logger.error(`Error adding food: ${error.message}`);
      return res.status(500).json({ message: `Failed to add food: ${error.message}` });
    }

    const normalizedData = data.map(food => ({
      ...food,
      category: food.categories?.name || null,
      additional_option_ids: food.additional_option_ids || [],
      image_urls: food.image_urls || [],
    }));

    logger.info(`Food added: ${name}`);
    return res.status(201).json(normalizedData[0]);
  } catch (error) {
    logger.error(`Error in createFood: ${error.message}`);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const updateFood = async (req, res) => {
  const { id } = req.params;
  const { name, price, description, category_id, additional_option_ids, image_urls, is_available } = req.body;

  if (!name && !price && description === undefined && category_id === undefined && additional_option_ids === undefined && image_urls === undefined && is_available === undefined) {
    logger.warn('No valid fields provided for update');
    return res.status(400).json({ message: 'At least one field must be provided' });
  }

  if (category_id) {
    const { data: category, error: categoryError } = await supabase
      .from('categories')
      .select('id')
      .eq('id', category_id)
      .single();

    if (categoryError || !category) {
      logger.warn(`Invalid category_id: ${category_id}`);
      return res.status(400).json({ message: 'Invalid category ID' });
    }
  }

  if (additional_option_ids && additional_option_ids.length > 0) {
    const { data: options, error: optionsError } = await supabase
      .from('additional_options')
      .select('id')
      .in('id', additional_option_ids);

    if (optionsError) {
      logger.error(`Error validating additional_option_ids: ${optionsError.message}`);
      return res.status(500).json({ message: 'Failed to validate additional options' });
    }

    if (options.length !== additional_option_ids.length) {
      logger.warn(`Invalid additional_option_ids: ${additional_option_ids}`);
      return res.status(400).json({ message: 'One or more additional option IDs are invalid' });
    }
  }

  const updates = {};
  if (name) updates.name = name;
  if (typeof price === 'number') updates.price = price;
  if (description !== undefined) updates.description = description;
  if (category_id !== undefined) updates.category_id = category_id;
  if (additional_option_ids !== undefined) updates.additional_option_ids = additional_option_ids;
  if (image_urls !== undefined) updates.image_urls = image_urls;
  if (is_available !== undefined) updates.is_available = is_available;
  updates.updated_at = new Date().toISOString();

  try {
    if (!supabase) {
      logger.error('Supabase client is not initialized. Check SUPABASE_URL and SUPABASE_SERVICE_KEY in your environment variables.');
      throw new Error('Supabase client is not initialized');
    }

    const { error: updateError } = await supabase
      .from('foods')
      .update(updates)
      .eq('id', id);

    if (updateError) {
      logger.error(`Error updating food: ${updateError.message}`);
      return res.status(500).json({ message: `Failed to update food: ${updateError.message}` });
    }

    const { data, error: fetchError } = await supabase
      .from('foods')
      .select(`
        *,
        categories!foods_category_id_fkey (name)
      `)
      .eq('id', id)
      .single();

    if (fetchError) {
      logger.error(`Error fetching updated food: ${fetchError.message}`);
      return res.status(500).json({ message: `Failed to fetch updated food: ${fetchError.message}` });
    }

    if (!data) {
      logger.warn(`Food not found: ${id}`);
      return res.status(404).json({ message: 'Food not found' });
    }

    const normalizedData = {
      ...data,
      category: data.categories?.name || null,
      additional_option_ids: data.additional_option_ids || [],
      image_urls: data.image_urls || [],
    };

    logger.info(`Food updated: ${id}`);
    return res.status(200).json(normalizedData);
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

      const { data, error } = await supabase.storage
        .from('food_images')
        .upload(fileName, file.buffer, {
          contentType: file.mimetype,
        });

      if (error) {
        logger.error(`Error uploading image to Supabase Storage: ${error.message}`);
        return res.status(500).json({ message: 'Failed to upload image to storage' });
      }

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

module.exports = { getFoods, getPublicFoods, createFood, updateFood, deleteFood, uploadFoodImage };