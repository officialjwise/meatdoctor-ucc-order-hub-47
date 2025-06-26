
const { supabase } = require('../config/supabase');
const logger = require('../utils/logger');
const sanitizeHtml = require('sanitize-html');

const updateSettings = async (req, res, next) => {
  try {
    if (!supabase) {
      logger.error('Supabase client is not initialized.');
      throw new Error('Supabase client is not initialized');
    }

    const { email_settings, sms_settings, background_image_url, site_name, site_description, footer_text, admin_phone_numbers } = req.body;

    if (!email_settings && !sms_settings && !background_image_url && !site_name && !site_description && !footer_text && !admin_phone_numbers) {
      throw new Error('At least one setting is required');
    }

    const updateData = { updated_at: new Date().toISOString() };
    if (email_settings) updateData.email_settings = email_settings;
    if (sms_settings) updateData.sms_settings = sms_settings;
    if (background_image_url) updateData.background_image_url = background_image_url;
    if (site_name) updateData.site_name = site_name;
    if (site_description) updateData.site_description = site_description;
    if (footer_text) {
      updateData.footer_text = sanitizeHtml(footer_text, {
        allowedTags: ['b', 'i', 'em', 'strong', 'a'],
        allowedAttributes: { a: ['href'] },
      });
    }
    if (admin_phone_numbers && Array.isArray(admin_phone_numbers)) {
      updateData.admin_phone_numbers = admin_phone_numbers;
    }

    // Get the first settings row to update
    const { data: existingSettings, error: fetchError } = await supabase
      .from('settings')
      .select('id')
      .order('created_at', { ascending: true })
      .limit(1)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      logger.error(`Supabase error fetching settings: ${JSON.stringify(fetchError)}`);
      throw new Error(`Failed to fetch settings: ${fetchError.message}`);
    }

    let data;
    if (existingSettings) {
      // Update existing settings
      const { data: updatedData, error: updateError } = await supabase
        .from('settings')
        .update(updateData)
        .eq('id', existingSettings.id)
        .select()
        .single();

      if (updateError) {
        logger.error(`Supabase error updating settings: ${JSON.stringify(updateError)}`);
        throw new Error(`Failed to update settings: ${updateError.message}`);
      }
      data = updatedData;
    } else {
      // Create new settings row
      const defaultSettings = {
        email_settings: null,
        sms_settings: null,
        background_image_url: null,
        site_name: 'MeatDoctor UCC',
        site_description: 'Your favorite food delivery service',
        footer_text: '© 2025 MeatDoctor UCC. All rights reserved.',
        admin_phone_numbers: ['+233543482189', '+233509106283'],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ...updateData
      };

      const { data: newData, error: insertError } = await supabase
        .from('settings')
        .insert([defaultSettings])
        .select()
        .single();

      if (insertError) {
        logger.error(`Supabase error creating settings: ${JSON.stringify(insertError)}`);
        throw new Error(`Failed to create settings: ${insertError.message}`);
      }
      data = newData;
    }

    // Clean up extra rows
    const { error: deleteError } = await supabase
      .from('settings')
      .delete()
      .neq('id', data.id);

    if (deleteError) {
      logger.error(`Supabase error deleting extra settings rows: ${JSON.stringify(deleteError)}`);
      throw new Error(`Failed to delete extra settings rows: ${deleteError.message}`);
    }

    res.status(200).json({ message: 'Settings updated successfully' });
  } catch (err) {
    logger.error(`Update settings error: ${err.message}`, { stack: err.stack });
    next(err);
  }
};

const getSettings = async (req, res, next) => {
  try {
    if (!supabase) {
      logger.error('Supabase client is not initialized.');
      throw new Error('Supabase client is not initialized');
    }

    let { data, error } = await supabase
      .from('settings')
      .select('id, email_settings, sms_settings, background_image_url, site_name, site_description, footer_text, contact_email, contact_phone, contact_address, dark_mode_enabled, notifications_enabled, admin_phone_numbers, created_at, updated_at')
      .order('created_at', { ascending: true })
      .limit(1)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows exist, create a default row
        const defaultSettings = {
          email_settings: null,
          sms_settings: null,
          background_image_url: null,
          site_name: 'MeatDoctor UCC',
          site_description: 'Your favorite food delivery service',
          footer_text: '© 2025 MeatDoctor UCC. All rights reserved.',
          admin_phone_numbers: ['+233543482189', '+233509106283'],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        const { data: newData, error: insertError } = await supabase
          .from('settings')
          .insert(defaultSettings)
          .select()
          .single();

        if (insertError) {
          logger.error(`Supabase error creating default settings: ${JSON.stringify(insertError)}`);
          throw new Error(`Failed to create default settings: ${insertError.message}`);
        }

        data = newData;
      } else {
        logger.error(`Supabase error in getSettings: ${JSON.stringify(error)}`);
        throw new Error(`Failed to fetch settings: ${error.message}`);
      }
    }

    // Clean up extra rows only if data exists
    if (data && data.id) {
      const { error: deleteError } = await supabase
        .from('settings')
        .delete()
        .neq('id', data.id);

      if (deleteError) {
        logger.error(`Supabase error cleaning up extra settings rows: ${JSON.stringify(deleteError)}`);
        throw new Error(`Failed to clean up extra settings: ${deleteError.message}`);
      }
    }

    // Sanitize footer_text
    if (data.footer_text) {
      data.footer_text = sanitizeHtml(data.footer_text, {
        allowedTags: ['b', 'i', 'em', 'strong', 'a'],
        allowedAttributes: { a: ['href'] },
      });
    }

    res.status(200).json(data || {});
  } catch (err) {
    logger.error(`Get settings error: ${err.message}`, { stack: err.stack });
    res.status(500).json({ message: `Internal server error: ${err.message}` });
  }
};

const uploadBackgroundImage = async (req, res, next) => {
  try {
    if (!supabase) {
      logger.error('Supabase client is not initialized.');
      throw new Error('Supabase client is not initialized');
    }

    const { file } = req;
    console.log('Received file:', file);
    if (!file) throw new Error('No file uploaded');

    const fileName = `bg-${Date.now()}-${file.originalname}`;
    const { data, error } = await supabase.storage
      .from('background-images')
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
      });

    if (error) {
      logger.error(`Supabase error uploading background image: ${JSON.stringify(error)}`);
      throw new Error(`Failed to upload background image: ${error.message}`);
    }

    const { publicUrl } = supabase.storage
      .from('background-images')
      .getPublicUrl(fileName).data;

    // Fetch the existing settings row
    let { data: settings, error: fetchError } = await supabase
      .from('settings')
      .select('id')
      .order('created_at', { ascending: true })
      .limit(1)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        // No rows exist, create a default row
        const defaultSettings = {
          email_settings: null,
          sms_settings: null,
          background_image_url: publicUrl,
          site_name: 'MeatDoctor UCC',
          site_description: 'Your favorite food delivery service',
          footer_text: '© 2025 MeatDoctor UCC. All rights reserved.',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        const { data: newData, error: insertError } = await supabase
          .from('settings')
          .insert(defaultSettings)
          .select()
          .single();

        if (insertError) {
          logger.error(`Supabase error creating default settings: ${JSON.stringify(insertError)}`);
          throw new Error(`Failed to create default settings: ${insertError.message}`);
        }

        settings = newData;
      } else {
        logger.error(`Supabase error fetching settings: ${JSON.stringify(fetchError)}`);
        throw new Error(`Failed to fetch settings: ${fetchError.message}`);
      }
    }

    // Update the existing row with the background image URL
    const { error: updateError } = await supabase
      .from('settings')
      .update({ background_image_url: publicUrl, updated_at: new Date().toISOString() })
      .eq('id', settings.id);

    if (updateError) {
      logger.error(`Supabase error updating background image URL: ${JSON.stringify(updateError)}`);
      throw new Error(`Failed to update background image URL: ${updateError.message}`);
    }

    // Clean up extra rows
    const { error: cleanupError } = await supabase
      .from('settings')
      .delete()
      .neq('id', settings.id);

    if (cleanupError) {
      logger.error(`Supabase error cleaning up extra settings rows: ${JSON.stringify(cleanupError)}`);
      throw new Error(`Failed to clean up extra settings: ${cleanupError.message}`);
    }

    res.status(200).json({ backgroundImageUrl: publicUrl });
  } catch (err) {
    logger.error(`Upload background error: ${err.message}`, { stack: err.stack });
    next(err);
  }
};

module.exports = { updateSettings, getSettings, uploadBackgroundImage };
