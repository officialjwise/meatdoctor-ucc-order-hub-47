const { supabase } = require('../config/supabase');
const logger = require('../utils/logger');

const getPaymentMethods = async (req, res) => {
  try {
    if (!supabase) {
      logger.error('Supabase client is not initialized. Check SUPABASE_URL and SUPABASE_SERVICE_KEY in your environment variables.');
      throw new Error('Supabase client is not initialized');
    }

    const { data, error } = await supabase
      .from('payment_methods')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      logger.error(`Error fetching payment methods: ${error.message}`);
      return res.status(500).json({ message: 'Failed to fetch payment methods' });
    }

    return res.status(200).json(data);
  } catch (error) {
    logger.error(`Error in getPaymentMethods: ${error.message}`);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const createPaymentMethod = async (req, res) => {
  const { name, description, is_active } = req.body;

  if (!name) {
    logger.warn('Invalid payment method data: name is required');
    return res.status(400).json({ message: 'Name is required' });
  }

  try {
    if (!supabase) {
      logger.error('Supabase client is not initialized. Check SUPABASE_URL and SUPABASE_SERVICE_KEY in your environment variables.');
      throw new Error('Supabase client is not initialized');
    }

    const { data, error } = await supabase
      .from('payment_methods')
      .insert([{ 
        name, 
        description: description || null, 
        is_active: is_active !== undefined ? is_active : true 
      }])
      .select();

    if (error) {
      logger.error(`Error adding payment method: ${error.message}`);
      return res.status(500).json({ message: 'Failed to add payment method' });
    }

    logger.info(`Payment method added: ${name}`);
    return res.status(201).json(data[0]);
  } catch (error) {
    logger.error(`Error in createPaymentMethod: ${error.message}`);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const updatePaymentMethod = async (req, res) => {
  const { id } = req.params;
  const { name, description, is_active } = req.body;

  if (!name && description === undefined && is_active === undefined) {
    logger.warn('No valid fields provided for update');
    return res.status(400).json({ message: 'At least one field must be provided' });
  }

  const updates = {};
  if (name) updates.name = name;
  if (description !== undefined) updates.description = description;
  if (is_active !== undefined) updates.is_active = is_active;
  updates.updated_at = new Date().toISOString();

  try {
    if (!supabase) {
      logger.error('Supabase client is not initialized. Check SUPABASE_URL and SUPABASE_SERVICE_KEY in your environment variables.');
      throw new Error('Supabase client is not initialized');
    }

    const { data, error } = await supabase
      .from('payment_methods')
      .update(updates)
      .eq('id', id)
      .select();

    if (error) {
      logger.error(`Error updating payment method: ${error.message}`);
      return res.status(500).json({ message: 'Failed to update payment method' });
    }

    if (!data || data.length === 0) {
      logger.warn(`Payment method not found: ${id}`);
      return res.status(404).json({ message: 'Payment method not found' });
    }

    logger.info(`Payment method updated: ${id}`);
    return res.status(200).json(data[0]);
  } catch (error) {
    logger.error(`Error in updatePaymentMethod: ${error.message}`);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const deletePaymentMethod = async (req, res) => {
  const { id } = req.params;

  try {
    if (!supabase) {
      logger.error('Supabase client is not initialized. Check SUPABASE_URL and SUPABASE_SERVICE_KEY in your environment variables.');
      throw new Error('Supabase client is not initialized');
    }

    const { data: paymentMethod, error: fetchError } = await supabase
      .from('payment_methods')
      .select('id')
      .eq('id', id)
      .single();

    if (fetchError) {
      logger.error(`Error checking payment method existence: ${fetchError.message}`);
      return res.status(500).json({ message: 'Failed to delete payment method' });
    }

    if (!paymentMethod) {
      logger.warn(`Payment method not found: ${id}`);
      return res.status(404).json({ message: 'Payment method not found' });
    }

    const { error: deleteError } = await supabase
      .from('payment_methods')
      .delete()
      .eq('id', id);

    if (deleteError) {
      logger.error(`Error deleting payment method: ${deleteError.message}`);
      return res.status(500).json({ message: 'Failed to delete payment method' });
    }

    logger.info(`Payment method deleted: ${id}`);
    return res.status(200).json({ message: 'Payment method deleted successfully' });
  } catch (error) {
    logger.error(`Error in deletePaymentMethod: ${error.message}`);
    return res.status(500).json({ message: 'Failed to delete payment method' });
  }
};

module.exports = {
  getPaymentMethods,
  createPaymentMethod,
  updatePaymentMethod,
  deletePaymentMethod,
};