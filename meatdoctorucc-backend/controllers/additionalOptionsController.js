const { supabase } = require('../config/supabase');
const logger = require('../utils/logger');

const getAdditionalOptions = async (req, res) => {
  try {
    if (!supabase) {
      logger.error('Supabase client is not initialized.');
      throw new Error('Supabase client is not initialized');
    }

    const { data, error } = await supabase
      .from('additional_options')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      logger.error(`Error fetching additional options: ${error.message}`);
      return res.status(500).json({ message: 'Failed to fetch additional options' });
    }

    return res.status(200).json(data);
  } catch (error) {
    logger.error(`Error in getAdditionalOptions: ${error.message}`);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const getPublicAdditionalOptions = async (req, res) => {
  try {
    if (!supabase) {
      logger.error('Supabase client is not initialized.');
      throw new Error('Supabase client is not initialized');
    }

    const { data, error } = await supabase
      .from('additional_options')
      .select('id, name, type, price')
      .order('name', { ascending: true });

    if (error) {
      logger.error(`Error fetching public additional options: ${error.message}`);
      return res.status(500).json({ message: 'Failed to fetch additional options' });
    }

    return res.status(200).json(data);
  } catch (error) {
    logger.error(`Error in getPublicAdditionalOptions: ${error.message}`);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const createAdditionalOption = async (req, res) => {
  const { name, type, price } = req.body;

  if (!name || !type || price === undefined) {
    logger.warn('Additional option name, type, and price are required');
    return res.status(400).json({ message: 'Name, type, and price are required' });
  }

  try {
    if (!supabase) {
      logger.error('Supabase client is not initialized.');
      throw new Error('Supabase client is not initialized');
    }

    const { data, error } = await supabase
      .from('additional_options')
      .insert([{ name, type, price }])
      .select();

    if (error) {
      logger.error(`Error adding additional option: ${error.message}`);
      return res.status(500).json({ message: 'Failed to add additional option' });
    }

    logger.info(`Additional option added: ${name}`);
    return res.status(201).json(data[0]);
  } catch (error) {
    logger.error(`Error in createAdditionalOption: ${error.message}`);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const updateAdditionalOption = async (req, res) => {
  const { id } = req.params;
  const { name, type, price } = req.body;

  if (!name && !type && price === undefined) {
    logger.warn('At least one field must be provided for update');
    return res.status(400).json({ message: 'At least one field must be provided' });
  }

  const updates = {};
  if (name) updates.name = name;
  if (type) updates.type = type;
  if (price !== undefined) updates.price = price;
  updates.updated_at = new Date().toISOString();

  try {
    if (!supabase) {
      logger.error('Supabase client is not initialized.');
      throw new Error('Supabase client is not initialized');
    }

    const { data, error } = await supabase
      .from('additional_options')
      .update(updates)
      .eq('id', id)
      .select();

    if (error) {
      logger.error(`Error updating additional option: ${error.message}`);
      return res.status(500).json({ message: 'Failed to update additional option' });
    }

    if (!data || data.length === 0) {
      logger.warn(`Additional option not found: ${id}`);
      return res.status(404).json({ message: 'Additional option not found' });
    }

    logger.info(`Additional option updated: ${id}`);
    return res.status(200).json(data[0]);
  } catch (error) {
    logger.error(`Error in updateAdditionalOption: ${error.message}`);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const deleteAdditionalOption = async (req, res) => {
  const { id } = req.params;

  try {
    if (!supabase) {
      logger.error('Supabase client is not initialized.');
      throw new Error('Supabase client is not initialized');
    }

    const { data: option, error: fetchError } = await supabase
      .from('additional_options')
      .select('id')
      .eq('id', id)
      .single();

    if (fetchError) {
      logger.error(`Error checking additional option existence: ${fetchError.message}`);
      return res.status(500).json({ message: 'Failed to delete additional option' });
    }

    if (!option) {
      logger.warn(`Additional option not found: ${id}`);
      return res.status(404).json({ message: 'Additional option not found' });
    }

    const { error: deleteError } = await supabase
      .from('additional_options')
      .delete()
      .eq('id', id);

    if (deleteError) {
      logger.error(`Error deleting additional option: ${deleteError.message}`);
      return res.status(500).json({ message: 'Failed to delete additional option' });
    }

    logger.info(`Additional option deleted: ${id}`);
    return res.status(200).json({ message: 'Additional option deleted successfully' });
  } catch (error) {
    logger.error(`Error in deleteAdditionalOption: ${error.message}`);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  getAdditionalOptions,
  getPublicAdditionalOptions,
  createAdditionalOption,
  updateAdditionalOption,
  deleteAdditionalOption,
};