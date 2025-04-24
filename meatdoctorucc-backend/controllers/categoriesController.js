const { supabase } = require('../config/supabase');
const logger = require('../utils/logger');

const getCategories = async (req, res) => {
  try {
    if (!supabase) {
      logger.error('Supabase client is not initialized.');
      throw new Error('Supabase client is not initialized');
    }

    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      logger.error(`Error fetching categories: ${error.message}`);
      return res.status(500).json({ message: 'Failed to fetch categories' });
    }

    return res.status(200).json(data);
  } catch (error) {
    logger.error(`Error in getCategories: ${error.message}`);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const createCategory = async (req, res) => {
  const { name } = req.body;

  if (!name) {
    logger.warn('Invalid category data: name is required');
    return res.status(400).json({ message: 'Name is required' });
  }

  try {
    if (!supabase) {
      logger.error('Supabase client is not initialized.');
      throw new Error('Supabase client is not initialized');
    }

    const { data, error } = await supabase
      .from('categories')
      .insert([{ name }])
      .select();

    if (error) {
      logger.error(`Error adding category: ${error.message}`);
      return res.status(500).json({ message: 'Failed to add category' });
    }

    logger.info(`Category added: ${name}`);
    return res.status(201).json(data[0]);
  } catch (error) {
    logger.error(`Error in createCategory: ${error.message}`);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const updateCategory = async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  if (!name) {
    logger.warn('No valid fields provided for update');
    return res.status(400).json({ message: 'Name is required' });
  }

  const updates = { name, updated_at: new Date().toISOString() };

  try {
    if (!supabase) {
      logger.error('Supabase client is not initialized.');
      throw new Error('Supabase client is not initialized');
    }

    const { data, error } = await supabase
      .from('categories')
      .update(updates)
      .eq('id', id)
      .select();

    if (error) {
      logger.error(`Error updating category: ${error.message}`);
      return res.status(500).json({ message: 'Failed to update category' });
    }

    if (!data || data.length === 0) {
      logger.warn(`Category not found: ${id}`);
      return res.status(404).json({ message: 'Category not found' });
    }

    logger.info(`Category updated: ${id}`);
    return res.status(200).json(data[0]);
  } catch (error) {
    logger.error(`Error in updateCategory: ${error.message}`);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const deleteCategory = async (req, res) => {
  const { id } = req.params;

  try {
    if (!supabase) {
      logger.error('Supabase client is not initialized.');
      throw new Error('Supabase client is not initialized');
    }

    const { data: category, error: fetchError } = await supabase
      .from('categories')
      .select('id')
      .eq('id', id)
      .single();

    if (fetchError) {
      logger.error(`Error checking category existence: ${fetchError.message}`);
      return res.status(500).json({ message: 'Failed to delete category' });
    }

    if (!category) {
      logger.warn(`Category not found: ${id}`);
      return res.status(404).json({ message: 'Category not found' });
    }

    const { error: deleteError } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);

    if (deleteError) {
      logger.error(`Error deleting category: ${deleteError.message}`);
      return res.status(500).json({ message: 'Failed to delete category' });
    }

    logger.info(`Category deleted: ${id}`);
    return res.status(200).json({ message: 'Category deleted successfully' });
  } catch (error) {
    logger.error(`Error in deleteCategory: ${error.message}`);
    return res.status(500).json({ message: 'Failed to delete category' });
  }
};

module.exports = {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
};