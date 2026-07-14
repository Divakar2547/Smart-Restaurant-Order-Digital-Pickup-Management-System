const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { getStaff, createStaff, updateStaff, deleteStaff, getCustomers, getDashboardStats, getSalesReport, getSettings, updateSettings } = require('../controllers/adminController');

router.use(protect, authorize('admin'));

router.get('/dashboard', getDashboardStats);
router.get('/staff', getStaff);
router.post('/staff', createStaff);
router.put('/staff/:id', updateStaff);
router.delete('/staff/:id', deleteStaff);
router.get('/customers', getCustomers);
router.get('/reports/sales', getSalesReport);
router.get('/settings', getSettings);
router.put('/settings', updateSettings);

module.exports = router;
