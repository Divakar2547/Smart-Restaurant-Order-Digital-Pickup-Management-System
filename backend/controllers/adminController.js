const User = require('../models/User');
const Order = require('../models/Order');
const Settings = require('../models/Settings');

exports.getStaff = async (req, res, next) => {
  try {
    const staff = await User.find({ role: { $in: ['cashier', 'kitchen', 'pickup'] } }).select('-password');
    res.json({ success: true, data: staff });
  } catch (error) { next(error); }
};

exports.createStaff = async (req, res, next) => {
  try {
    const { name, email, phone, password, role } = req.body;
    if (!['cashier', 'kitchen', 'pickup'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid staff role' });
    }
    const user = await User.create({ name, email, phone, password, role });
    res.status(201).json({ success: true, data: user });
  } catch (error) { next(error); }
};

exports.updateStaff = async (req, res, next) => {
  try {
    const { password, ...updateData } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true }).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'Staff not found' });
    res.json({ success: true, data: user });
  } catch (error) { next(error); }
};

exports.deleteStaff = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!user) return res.status(404).json({ success: false, message: 'Staff not found' });
    res.json({ success: true, message: 'Staff deactivated' });
  } catch (error) { next(error); }
};

exports.getCustomers = async (req, res, next) => {
  try {
    const customers = await User.find({ role: 'customer' }).select('-password');
    res.json({ success: true, data: customers });
  } catch (error) { next(error); }
};

exports.getDashboardStats = async (req, res, next) => {
  try {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const [totalOrders, todayOrders, totalCustomers, totalStaff, revenueData] = await Promise.all([
      Order.countDocuments(),
      Order.countDocuments({ createdAt: { $gte: today } }),
      User.countDocuments({ role: 'customer' }),
      User.countDocuments({ role: { $in: ['cashier', 'kitchen', 'pickup'] } }),
      Order.aggregate([
        { $match: { orderStatus: 'delivered' } },
        { $group: { _id: null, total: { $sum: '$totalAmount' }, today: { $sum: { $cond: [{ $gte: ['$createdAt', today] }, '$totalAmount', 0] } } } }
      ])
    ]);
    const revenue = revenueData[0] || { total: 0, today: 0 };
    res.json({ success: true, data: { totalOrders, todayOrders, totalCustomers, totalStaff, totalRevenue: revenue.total, todayRevenue: revenue.today } });
  } catch (error) { next(error); }
};

exports.getSalesReport = async (req, res, next) => {
  try {
    const { period = 'daily' } = req.query;
    let groupBy, dateFilter = {};
    const now = new Date();

    if (period === 'daily') {
      const start = new Date(now); start.setDate(start.getDate() - 30);
      dateFilter = { createdAt: { $gte: start } };
      groupBy = { year: { $year: '$createdAt' }, month: { $month: '$createdAt' }, day: { $dayOfMonth: '$createdAt' } };
    } else if (period === 'weekly') {
      const start = new Date(now); start.setDate(start.getDate() - 84);
      dateFilter = { createdAt: { $gte: start } };
      groupBy = { year: { $year: '$createdAt' }, week: { $week: '$createdAt' } };
    } else {
      const start = new Date(now); start.setMonth(start.getMonth() - 12);
      dateFilter = { createdAt: { $gte: start } };
      groupBy = { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } };
    }

    const data = await Order.aggregate([
      { $match: { ...dateFilter, orderStatus: 'delivered' } },
      { $group: { _id: groupBy, revenue: { $sum: '$totalAmount' }, orders: { $sum: 1 } } },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);
    res.json({ success: true, data });
  } catch (error) { next(error); }
};

exports.getSettings = async (req, res, next) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) settings = await Settings.create({});
    res.json({ success: true, data: settings });
  } catch (error) { next(error); }
};

exports.updateSettings = async (req, res, next) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) settings = await Settings.create(req.body);
    else { Object.assign(settings, req.body); await settings.save(); }
    res.json({ success: true, data: settings });
  } catch (error) { next(error); }
};
