const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { upload } = require('../config/cloudinary');
const { getCategories, createCategory, updateCategory, deleteCategory, getFoods, createFood, updateFood, deleteFood } = require('../controllers/menuController');

router.get('/categories', getCategories);
router.post('/categories', protect, authorize('admin', 'cashier'), createCategory);
router.put('/categories/:id', protect, authorize('admin', 'cashier'), updateCategory);
router.delete('/categories/:id', protect, authorize('admin'), deleteCategory);

router.get('/foods', getFoods);
router.post('/foods', protect, authorize('admin', 'cashier'), upload.single('image'), createFood);
router.put('/foods/:id', protect, authorize('admin', 'cashier'), upload.single('image'), updateFood);
router.delete('/foods/:id', protect, authorize('admin', 'cashier'), deleteFood);

module.exports = router;
