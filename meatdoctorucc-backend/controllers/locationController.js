const supabase = require('../config/supabase');
const logger = require('../utils/logger');

const getLocations = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('locations')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      logger.error(`Supabase error fetching locations: ${JSON.stringify(error)}`);
      throw new Error('Failed to fetch locations');
    }

    res.status(200).json(data);
  } catch (err) {
    logger.error(`Fetch locations error: ${err.message}`);
    next(err);
  }
};

const createLocation = async (req, res, next) => {
  try {
    const { name, active } = req.body;

    if (!name) {
      throw new Error('Name is required');
    }

    const { data, error } = await supabase
      .from('locations')
      .insert({ name, active: active ?? true })
      .select()
      .single();

    if (error) {
      logger.error(`Supabase error creating location: ${JSON.stringify(error)}`);
      throw new Error('Failed to create location');
    }

    res.status(201).json(data);
  } catch (err) {
    logger.error(`Create location error: ${err.message}`);
    next(err);
  }
};

const updateLocation = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, active } = req.body;

    const updateData = { updated_at: new Date().toISOString() };
    if (name) updateData.name = name;
    if (typeof active === 'boolean') updateData.active = active;

    const { data, error } = await supabase
      .from('locations')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      logger.error(`Supabase error updating location: ${JSON.stringify(error)}`);
      throw new Error('Failed to update location');
    }

    res.status(200).json(data);
  } catch (err) {
    logger.error(`Update location error: ${err.message}`);
    next(err);
  }
};

module.exports = { getLocations, createLocation, updateLocation };