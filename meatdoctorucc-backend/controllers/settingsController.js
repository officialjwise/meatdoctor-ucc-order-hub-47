const supabase = require('../config/supabase');
const logger = require('../utils/logger');

const updateSettings = async (req, res, next) => {
  try {
    const { email_settings, sms_settings, background_image_url } = req.body;

    if (!email_settings && !sms_settings && !background_image_url) {
      throw new Error('At least one setting (email_settings, sms_settings, or background_image_url) is required');
    }

    const updateData = { updated_at: new Date().toISOString() };
    if (email_settings) updateData.email_settings = email_settings;
    if (sms_settings) updateData.sms_settings = sms_settings;
    if (background_image_url) updateData.background_image_url = background_image_url;

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
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows exist, create a default row
        const defaultSettings = {
          email_settings: null,
          sms_settings: null,
          background_image_url: null,
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

    const { data: settings, error: settingsError } = await supabase
      .from('settings')
      .upsert(
        { background_image_url: publicUrl, updated_at: new Date().toISOString() },
        { onConflict: 'id' }
      )
      .select()
      .single();

    if (settingsError) {
      logger.error(`Supabase error updating background image URL: ${JSON.stringify(settingsError)}`);
      throw new Error('Failed to update background image URL');
    }

    res.status(200).json({ backgroundImageUrl: publicUrl });
  } catch (err) {
    logger.error(`Upload background error: ${err.message}`);
    next(err);
  }
};

module.exports = { updateSettings, getSettings, uploadBackgroundImage };