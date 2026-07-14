const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { getProfile, updateProfile, getNotifications, markNotificationRead, markAllNotificationsRead } = require('../controllers/customerController');

router.use(protect);
router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.get('/notifications', getNotifications);
router.put('/notifications/:id/read', markNotificationRead);
router.put('/notifications/read-all', markAllNotificationsRead);

module.exports = router;
