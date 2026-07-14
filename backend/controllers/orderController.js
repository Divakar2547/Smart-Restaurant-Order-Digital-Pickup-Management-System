const Order = require('../models/Order');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { generatePickupCode } = require('../utils/helpers');
const { sendSMS } = require('../utils/sms');
const QRCode = require('qrcode');

exports.createOrder = async (req, res, next) => {
  try {
    let { customerName, customerPhone, orderedItems, discount = 0, gst = 5, paymentMethod = 'cash', notes = '' } = req.body;

    // If customer is ordering themselves, use their profile
    if (req.user.role === 'customer') {
      customerName = req.user.name;
      customerPhone = req.user.phone || customerPhone || '0000000000';
      discount = 0;
    }

    let pickupCode, isUnique = false;
    while (!isUnique) {
      pickupCode = generatePickupCode();
      const existing = await Order.findOne({ pickupCode, pickupCodeUsed: false });
      if (!existing) isUnique = true;
    }

    const Food = require('../models/Food');
    const foodIds = orderedItems.map(i => i.food);
    const foods = await Food.find({ _id: { $in: foodIds } });
    const foodImageMap = {};
    foods.forEach(f => { foodImageMap[f._id.toString()] = f.image || ''; });
    const itemsWithImages = orderedItems.map(item => ({ ...item, foodImage: foodImageMap[item.food] || '' }));

    const subtotal = itemsWithImages.reduce((sum, item) => sum + item.subtotal, 0);
    const discountAmount = (subtotal * discount) / 100;
    const gstAmount = ((subtotal - discountAmount) * gst) / 100;
    const totalAmount = subtotal - discountAmount + gstAmount;

    const customer = req.user.role === 'customer' ? req.user : await User.findOne({ phone: customerPhone, role: 'customer' });
    const qrCode = await QRCode.toDataURL(pickupCode);

    const order = await Order.create({
      customer: customer?._id,
      customerName,
      customerPhone,
      pickupCode,
      orderedItems: itemsWithImages,
      subtotal,
      discount,
      gst,
      gstAmount,
      totalAmount,
      paymentMethod,
      paymentStatus: req.user.role === 'customer' ? 'pending' : 'paid',
      createdBy: req.user._id,
      qrCode,
      notes,
    });

    await order.populate('orderedItems.food', 'foodName');

    // Send SMS
    const smsMsg = `Hi ${customerName}! Your order at Smart Restaurant is confirmed.\nPickup Code: ${pickupCode}\nTotal: ₹${totalAmount.toFixed(2)}\nShow this code at pickup counter.`;
    sendSMS(customerPhone, smsMsg);

    // Create notification if customer exists
    if (customer) {
      await Notification.create({ user: customer._id, order: order._id, message: `Order placed! Your pickup code is ${pickupCode}`, type: 'order_placed' });
    }

    // Emit to kitchen via socket
    const io = req.app.get('io');
    if (io) io.emit('new_order', order);

    res.status(201).json({ success: true, data: order });
  } catch (error) { next(error); }
};

exports.getOrders = async (req, res, next) => {
  try {
    const { status, date, page = 1, limit = 20 } = req.query;
    const query = {};
    if (status) query.orderStatus = status;
    if (date) {
      const start = new Date(date); start.setHours(0, 0, 0, 0);
      const end = new Date(date); end.setHours(23, 59, 59, 999);
      query.createdAt = { $gte: start, $lte: end };
    }

    const skip = (page - 1) * limit;
    const [orders, total] = await Promise.all([
      Order.find(query).populate('customer', 'name email').populate('createdBy', 'name').populate('orderedItems.food', 'image').sort('-createdAt').skip(skip).limit(Number(limit)),
      Order.countDocuments(query)
    ]);

    // Attach food image from populated food ref if foodImage is missing
    const enriched = orders.map(o => {
      const obj = o.toObject();
      obj.orderedItems = obj.orderedItems.map(item => ({
        ...item,
        foodImage: item.foodImage || item.food?.image || ''
      }));
      return obj;
    });

    res.json({ success: true, data: enriched, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (error) { next(error); }
};

exports.getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate('customer', 'name email phone').populate('createdBy', 'name');
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    res.json({ success: true, data: order });
  } catch (error) { next(error); }
};

exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(req.params.id, { orderStatus: status }, { new: true });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    const io = req.app.get('io');
    if (io) io.emit('order_status_update', { orderId: order._id, status });

    // Notify customer when ready
    if (status === 'ready' && order.customer) {
      await Notification.create({ user: order.customer, order: order._id, message: `Your order is ready! Show pickup code ${order.pickupCode} at counter.`, type: 'order_ready' });
      sendSMS(order.customerPhone, `Your order is READY! Pickup Code: ${order.pickupCode}. Please come to the pickup counter.`);
    }

    res.json({ success: true, data: order });
  } catch (error) { next(error); }
};

exports.verifyPickupCode = async (req, res, next) => {
  try {
    const { code } = req.body;
    const order = await Order.findOne({ pickupCode: code }).populate('customer', 'name email phone');
    if (!order) return res.status(404).json({ success: false, message: 'Invalid pickup code' });
    if (order.pickupCodeUsed && req.user.role !== 'customer') return res.status(400).json({ success: false, message: 'Order already delivered' });
    res.json({ success: true, data: order });
  } catch (error) { next(error); }
};

exports.deliverOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    if (order.pickupCodeUsed) return res.status(400).json({ success: false, message: 'Order already delivered' });

    order.orderStatus = 'delivered';
    order.pickupCodeUsed = true;
    order.deliveredBy = req.user._id;
    order.deliveredAt = new Date();
    await order.save();

    const io = req.app.get('io');
    if (io) io.emit('order_status_update', { orderId: order._id, status: 'delivered' });

    if (order.customer) {
      await Notification.create({ user: order.customer, order: order._id, message: 'Your order has been delivered. Enjoy your meal!', type: 'order_delivered' });
    }

    res.json({ success: true, data: order });
  } catch (error) { next(error); }
};

exports.getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ customer: req.user._id }).sort('-createdAt');
    res.json({ success: true, data: orders });
  } catch (error) { next(error); }
};

exports.getMyCurrentOrder = async (req, res, next) => {
  try {
    const order = await Order.findOne({ customer: req.user._id, orderStatus: { $in: ['pending', 'preparing', 'ready'] } }).sort('-createdAt');
    res.json({ success: true, data: order });
  } catch (error) { next(error); }
};
