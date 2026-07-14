import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import StatusBadge from '../../components/ui/StatusBadge';
import { PageLoader } from '../../components/ui/LoadingSpinner';
import { customerLinks } from '../../utils/navLinks';
import api from '../../utils/api';
import { formatCurrency, formatDateTime } from '../../utils/helpers';
import { FiChevronDown, FiChevronUp } from 'react-icons/fi';

const CustomerOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    api.get('/orders/my-orders').then(({ data }) => { setOrders(data.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <DashboardLayout links={customerLinks}><PageLoader /></DashboardLayout>;

  return (
    <DashboardLayout links={customerLinks}>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Order History</h1>
        <div className="space-y-3">
          {orders.map(order => (
            <div key={order._id} className="card p-0 overflow-hidden">
              <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                onClick={() => setExpanded(expanded === order._id ? null : order._id)}>
                <div className="flex items-center gap-4">
                  <span className="font-mono font-bold text-purple-600 text-lg">{order.pickupCode}</span>
                  <div className="text-left">
                    <p className="text-sm font-medium">{order.orderedItems.length} items</p>
                    <p className="text-xs text-gray-400">{formatDateTime(order.createdAt)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={order.orderStatus} />
                  <span className="font-bold text-purple-600">{formatCurrency(order.totalAmount)}</span>
                  {expanded === order._id ? <FiChevronUp size={18} /> : <FiChevronDown size={18} />}
                </div>
              </button>
              {expanded === order._id && (
                <div className="border-t border-gray-100 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-700/30 space-y-2">
                  {order.orderedItems.map((item, i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span>× {item.quantity} {item.foodName}</span>
                      <span className="text-gray-500">{formatCurrency(item.subtotal)}</span>
                    </div>
                  ))}
                  <div className="border-t border-gray-200 dark:border-gray-600 pt-2 space-y-1 text-sm">
                    {order.discount > 0 && <div className="flex justify-between text-green-600"><span>Discount ({order.discount}%)</span><span>-{formatCurrency((order.subtotal * order.discount) / 100)}</span></div>}
                    <div className="flex justify-between text-gray-500"><span>GST ({order.gst}%)</span><span>+{formatCurrency(order.gstAmount)}</span></div>
                    <div className="flex justify-between font-bold"><span>Total</span><span className="text-purple-600">{formatCurrency(order.totalAmount)}</span></div>
                  </div>
                </div>
              )}
            </div>
          ))}
          {orders.length === 0 && (
            <div className="card text-center py-16 text-gray-400">
              <p>No orders yet</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CustomerOrders;
