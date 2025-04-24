const { supabase } = require('../config/supabase');
const logger = require('../utils/logger');

const getLocations = async (req, res) => {
  try {
    if (!supabase) {
      logger.error('Supabase client is not initialized.');
      throw new Error('Supabase client is not initialized');
    }

    const { data, error } = await supabase
      .from('locations')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      logger.error(`Error fetching locations: ${error.message}`);
      return res.status(500).json({ message: 'Failed to fetch locations' });
    }

    return res.status(200).json(data);
  } catch (error) {
    logger.error(`Error in getLocations: ${error.message}`);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const getPublicLocations = async (req, res) => {
  try {
    if (!supabase) {
      logger.error('Supabase client is not initialized.');
      throw new Error('Supabase client is not initialized');
    }

    const { data, error } = await supabase
      .from('locations')
      .select('name, is_active') // Updated to is_active
      .eq('is_active', true) // Updated to is_active
      .order('name', { ascending: true });

    if (error) {
      logger.error(`Error fetching public locations: ${error.message}`);
      return res.status(500).json({ message: 'Failed to fetch locations' });
    }

    return res.status(200).json(data);
  } catch (error) {
    logger.error(`Error in getPublicLocations: ${error.message}`);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const createLocation = async (req, res) => {
  const { name, is_active, description } = req.body; // Updated to is_active, added description

  if (!name) {
    logger.warn('Location name is required');
    return res.status(400).json({ message: 'Location name is required' });
  }

  try {
    if (!supabase) {
      logger.error('Supabase client is not initialized.');
      throw new Error('Supabase client is not initialized');
    }

    const { data, error } = await supabase
      .from('locations')
      .insert([{ name, is_active: is_active || false, description }]) // Updated to is_active, added description
      .select();

    if (error) {
      logger.error(`Error adding location: ${error.message}`);
      return res.status(500).json({ message: 'Failed to add location' });
    }

    logger.info(`Location added: ${name}`);
    return res.status(201).json(data[0]);
  } catch (error) {
    logger.error(`Error in createLocation: ${error.message}`);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const updateLocation = async (req, res) => {
  const { id } = req.params;
  const { name, is_active, description } = req.body; // Updated to is_active, added description

  if (!name && is_active === undefined && description === undefined) { // Updated to is_active
    logger.warn('At least one field must be provided for update');
    return res.status(400).json({ message: 'At least one field must be provided' });
  }

  const updates = {};
  if (name) updates.name = name;
  if (is_active !== undefined) updates.is_active = is_active; // Updated to is_active
  if (description !== undefined) updates.description = description; // Added description
  updates.updated_at = new Date().toISOString();

  try {
    if (!supabase) {
      logger.error('Supabase client is not initialized.');
      throw new Error('Supabase client is not initialized');
    }

    const { data, error } = await supabase
      .from('locations')
      .update(updates)
      .eq('id', id)
      .select();

    if (error) {
      logger.error(`Error updating location: ${error.message}`);
      return res.status(500).json({ message: 'Failed to update location' });
    }

    if (!data || data.length === 0) {
      logger.warn(`Location not found: ${id}`);
      return res.status(404).json({ message: 'Location not found' });
    }

    logger.info(`Location updated: ${id}`);
    return res.status(200).json(data[0]);
  } catch (error) {
    logger.error(`Error in updateLocation: ${error.message}`);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const deleteLocation = async (req, res) => {
  const { id } = req.params;

  try {
    if (!supabase) {
      logger.error('Supabase client is not initialized.');
      throw new Error('Supabase client is not initialized');
    }

    const { data: location, error: fetchError } = await supabase
      .from('locations')
      .select('id')
      .eq('id', id)
      .single();

    if (fetchError) {
      logger.error(`Error checking location existence: ${fetchError.message}`);
      return res.status(500).json({ message: 'Failed to delete location' });
    }

    if (!location) {
      logger.warn(`Location not found: ${id}`);
      return res.status(404).json({ message: 'Location not found' });
    }

    const { error: deleteError } = await supabase
      .from('locations')
      .delete()
      .eq('id', id);

    if (deleteError) {
      logger.error(`Error deleting location: ${deleteError.message}`);
      return res.status(500).json({ message: 'Failed to delete location' });
    }

    logger.info(`Location deleted: ${id}`);
    return res.status(200).json({ message: 'Location deleted successfully' });
  } catch (error) {
    logger.error(`Error in deleteLocation: ${error.message}`);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  getLocations,
  getPublicLocations,
  createLocation,
  updateLocation,
  deleteLocation,
};