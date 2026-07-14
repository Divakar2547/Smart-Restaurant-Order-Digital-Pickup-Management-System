const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { createOrder, getOrders, getOrderById, updateOrderStatus, verifyPickupCode, deliverOrder, getMyOrders, getMyCurrentOrder } = require('../controllers/orderController');

router.post('/', protect, authorize('cashier', 'admin', 'customer'), createOrder);
router.get('/', protect, authorize('admin', 'cashier', 'kitchen', 'pickup'), getOrders);
router.get('/my-orders', protect, authorize('customer'), getMyOrders);
router.get('/my-current', protect, authorize('customer'), getMyCurrentOrder);
router.get('/:id', protect, getOrderById);
router.put('/:id/status', protect, authorize('kitchen', 'admin'), updateOrderStatus);
router.post('/verify-code', protect, authorize('pickup', 'admin', 'customer'), verifyPickupCode);
router.put('/:id/deliver', protect, authorize('pickup', 'admin'), deliverOrder);

module.exports = router;
