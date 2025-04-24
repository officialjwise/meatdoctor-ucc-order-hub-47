const supabase = require('../config/supabase');
const logger = require('../utils/logger');

const updateSettings = async (req, res, next) => {
  try {
    const { email_settings, sms_settings, background_image_url, site_name, site_description } = req.body;

    if (!email_settings && !sms_settings && !background_image_url && !site_name && !site_description) {
      throw new Error('At least one setting (email_settings, sms_settings, background_image_url, site_name, or site_description) is required');
    }

    const updateData = { updated_at: new Date().toISOString() };
    if (email_settings) updateData.email_settings = email_settings;
    if (sms_settings) updateData.sms_settings = sms_settings;
    if (background_image_url) updateData.background_image_url = background_image_url;
    if (site_name) updateData.site_name = site_name;
    if (site_description) updateData.site_description = site_description;

    // Ensure only one row exists by deleting others
    await supabase.from('settings').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    const { data, error } = await supabase
      .from('settings')
      .upsert(updateData, { onConflict: 'id' })
      .select()
      .single();

    if (error) {
      logger.error(`Supabase error in updateSettings: ${JSON.stringify(error)}`);
      throw new Error('Failed to update settings');
    }

    res.status(200).json({ message: 'Settings updated successfully' });
  } catch (err) {
    logger.error(`Update settings error: ${err.message}`);
    next(err);
  }
};

const getSettings = async (req, res, next) => {
  try {
    let { data, error } = await supabase
      .from('settings')
      .select('*')
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
          throw new Error('Failed to create default settings');
        }

        data = newData;
      } else {
        logger.error(`Supabase error in getSettings: ${JSON.stringify(error)}`);
        throw new Error('Failed to fetch settings');
      }
    }

    // Clean up extra rows
    await supabase.from('settings').delete().neq('id', data.id);

    res.status(200).json(data || {});
  } catch (err) {
    logger.error(`Get settings error: ${err.message}`);
    next(err);
  }
};

const uploadBackgroundImage = async (req, res, next) => {
  try {
    const { file } = req;
    console.log('Received file:', file); // Debug log
    if (!file) throw new Error('No file uploaded');

    const fileName = `bg-${Date.now()}-${file.originalname}`;
    const { data, error } = await supabase.storage
      .from('background-images')
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
      });

    if (error) {
      logger.error(`Supabase error uploading background image: ${JSON.stringify(error)}`);
      throw new Error('Failed to upload background image');
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
          throw new Error('Failed to create default settings');
        }

        settings = newData;
      } else {
        logger.error(`Supabase error fetching settings: ${JSON.stringify(fetchError)}`);
        throw new Error('Failed to fetch settings');
      }
    }

    // Update the existing row with the background image URL
    const { error: updateError } = await supabase
      .from('settings')
      .update({ background_image_url: publicUrl, updated_at: new Date().toISOString() })
      .eq('id', settings.id);

    if (updateError) {
      logger.error(`Supabase error updating background image URL: ${JSON.stringify(updateError)}`);
      throw new Error('Failed to update background image URL');
    }

    // Clean up extra rows
    await supabase.from('settings').delete().neq('id', settings.id);

    res.status(200).json({ backgroundImageUrl: publicUrl });
  } catch (err) {
    logger.error(`Upload background error: ${err.message}`);
    next(err);
  }
};

module.exports = { updateSettings, getSettings, uploadBackgroundImage };