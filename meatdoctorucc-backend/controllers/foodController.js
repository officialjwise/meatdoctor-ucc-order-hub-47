const supabase = require('../config/supabase');

const createFood = async (req, res, next) => {
  try {
    const { name, description, price, imageUrl, category } = req.body;
    if (!name || !price) throw new Error('Name and price are required');

    const { data, error } = await supabase
      .from('foods')
      .insert([{ name, description, price, image_url: imageUrl, category, is_available: true }])
      .select()
      .single();

    if (error) throw new Error('Failed to create food item');

    res.status(201).json(data);
  } catch (err) {
    next(err);
  }
};

const updateFood = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const { data, error } = await supabase
      .from('foods')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error || !data) throw new Error('Failed to update food item');

    res.status(200).json(data);
  } catch (err) {
    next(err);
  }
};

const deleteFood = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('foods')
      .delete()
      .eq('id', id);

    if (error) throw new Error('Failed to delete food item');

    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

const getFoods = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('foods')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw new Error('Failed to fetch foods');

    res.status(200).json(data);
  } catch (err) {
    next(err);
  }
};

const uploadFoodImage = async (req, res, next) => {
  try {
    const { file } = req;
    if (!file) throw new Error('No file uploaded');

    const fileName = `${Date.now()}-${file.originalname}`;
    const { data, error } = await supabase.storage
      .from('food-images')
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
      });

    if (error) throw new Error('Failed to upload image');

    const { publicUrl } = supabase.storage
      .from('food-images')
      .getPublicUrl(fileName).data;

    res.status(200).json({ imageUrl: publicUrl });
  } catch (err) {
    next(err);
  }
};

module.exports = { createFood, updateFood, deleteFood, getFoods, uploadFoodImage };