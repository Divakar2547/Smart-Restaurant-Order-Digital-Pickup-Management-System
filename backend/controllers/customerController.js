const User = require('../models/User');
const Notification = require('../models/Notification');

exports.getProfile = async (req, res) => {
  res.json({ success: true, data: req.user });
};

exports.updateProfile = async (req, res, next) => {
  try {
    const { name, phone, email } = req.body;
    const user = await User.findByIdAndUpdate(req.user._id, { name, phone, email }, { new: true, runValidators: true }).select('-password');
    res.json({ success: true, data: user });
  } catch (error) { next(error); }
};

exports.getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ user: req.user._id }).sort('-createdAt').limit(20);
    res.json({ success: true, data: notifications });
  } catch (error) { next(error); }
};

exports.markNotificationRead = async (req, res, next) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { isRead: true });
    res.json({ success: true, message: 'Marked as read' });
  } catch (error) { next(error); }
};

exports.markAllNotificationsRead = async (req, res, next) => {
  try {
    await Notification.updateMany({ user: req.user._id, isRead: false }, { isRead: true });
    res.json({ success: true, message: 'All marked as read' });
  } catch (error) { next(error); }
};
