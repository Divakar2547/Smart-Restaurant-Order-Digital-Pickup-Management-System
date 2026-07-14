const Food = require('../models/Food');
const Category = require('../models/Category');
const { cloudinary } = require('../config/cloudinary');

exports.getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find({ isActive: true });
    res.json({ success: true, data: categories });
  } catch (error) { next(error); }
};

exports.createCategory = async (req, res, next) => {
  try {
    const category = await Category.create(req.body);
    res.status(201).json({ success: true, data: category });
  } catch (error) { next(error); }
};

exports.updateCategory = async (req, res, next) => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
    res.json({ success: true, data: category });
  } catch (error) { next(error); }
};

exports.deleteCategory = async (req, res, next) => {
  try {
    await Category.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ success: true, message: 'Category deleted' });
  } catch (error) { next(error); }
};

exports.getFoods = async (req, res, next) => {
  try {
    const { category, search, available } = req.query;
    const query = {};
    if (category) query.category = category;
    if (search) query.foodName = { $regex: search, $options: 'i' };
    if (available !== undefined) query.available = available === 'true';

    const foods = await Food.find(query).populate('category', 'categoryName').sort('-createdAt');
    res.json({ success: true, data: foods });
  } catch (error) { next(error); }
};

exports.createFood = async (req, res, next) => {
  try {
    const foodData = { ...req.body };
    if (req.file) { foodData.image = req.file.path; foodData.imagePublicId = req.file.filename; }
    else if (req.body.image) { foodData.image = req.body.image; }
    const food = await Food.create(foodData);
    await food.populate('category', 'categoryName');
    res.status(201).json({ success: true, data: food });
  } catch (error) { next(error); }
};

exports.updateFood = async (req, res, next) => {
  try {
    const food = await Food.findById(req.params.id);
    if (!food) return res.status(404).json({ success: false, message: 'Food not found' });

    if (req.file) {
      if (food.imagePublicId) await cloudinary.uploader.destroy(food.imagePublicId);
      req.body.image = req.file.path;
      req.body.imagePublicId = req.file.filename;
    }
    const updated = await Food.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate('category', 'categoryName');
    res.json({ success: true, data: updated });
  } catch (error) { next(error); }
};

exports.deleteFood = async (req, res, next) => {
  try {
    const food = await Food.findById(req.params.id);
    if (!food) return res.status(404).json({ success: false, message: 'Food not found' });
    if (food.imagePublicId) await cloudinary.uploader.destroy(food.imagePublicId);
    await food.deleteOne();
    res.json({ success: true, message: 'Food deleted' });
  } catch (error) { next(error); }
};
