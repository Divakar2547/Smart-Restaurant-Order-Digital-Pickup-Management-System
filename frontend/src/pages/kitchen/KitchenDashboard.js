import { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { PageLoader } from '../../components/ui/LoadingSpinner';
import api from '../../utils/api';
import { getSocket } from '../../hooks/useSocket';
import toast from 'react-hot-toast';
import { formatCurrency, formatDateTime } from '../../utils/helpers';
import { kitchenLinks } from '../../utils/navLinks';
import { MdPendingActions, MdOutdoorGrill, MdDoneAll } from 'react-icons/md';
import { FiClock, FiRefreshCw } from 'react-icons/fi';

const STATUS_FLOW = { pending: 'preparing', preparing: 'ready' };
const STATUS_LABELS = { pending: 'Start Preparing', preparing: 'Mark Ready' };

const OrderCard = ({ order, onStatusChange }) => {
  const [updating, setUpdating] = useState(false);
  const elapsed = Math.floor((Date.now() - new Date(order.createdAt)) / 60000);

  const handleNext = async () => {
    const nextStatus = STATUS_FLOW[order.orderStatus];
    if (!nextStatus) return;
    setUpdating(true);
    try {
      await api.put(`/orders/${order._id}/status`, { status: nextStatus });
      onStatusChange(order._id, nextStatus);
      toast.success(`Order ${order.pickupCode} → ${nextStatus}`);
    } catch { toast.error('Failed to update status'); }
    finally { setUpdating(false); }
  };

  const borderColors = { pending: 'border-l-yellow-400', preparing: 'border-l-blue-400', ready: 'border-l-green-400' };

  return (
    <div className={`card border-l-4 ${borderColors[order.orderStatus]} space-y-3`}>
      <div className="flex items-start justify-between">
        <div>
          <span className="text-2xl font-bold font-mono text-purple-600">{order.pickupCode}</span>
          <p className="text-sm font-medium text-gray-900 dark:text-white mt-0.5">{order.customerName}</p>
        </div>
        <div className="text-right">
          <div className={`flex items-center gap-1 text-xs ${elapsed > 15 ? 'text-red-500' : 'text-gray-400'}`}>
            <FiClock size={12} /> {elapsed}m ago
          </div>
          <p className="text-xs text-gray-400 mt-0.5">{formatDateTime(order.createdAt)}</p>
        </div>
      </div>
      <div className="space-y-2">
        {order.orderedItems.map((item, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 flex-shrink-0">
              {item.foodImage
                ? <img src={item.foodImage} alt={item.foodName} className="w-full h-full object-cover" />
                : <div className="w-full h-full flex items-center justify-center text-xl">🍽️</div>}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">× {item.quantity} {item.foodName}</p>
              <p className="text-xs text-gray-500">{formatCurrency(item.subtotal)}</p>
            </div>
          </div>
        ))}
      </div>
      {order.notes && <p className="text-xs bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300 p-2 rounded-lg">📝 {order.notes}</p>}
      <div className="flex items-center justify-between pt-1 border-t border-gray-100 dark:border-gray-700">
        <span className="font-bold text-gray-900 dark:text-white">{formatCurrency(order.totalAmount)}</span>
        {STATUS_FLOW[order.orderStatus] && (
          <button onClick={handleNext} disabled={updating}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${order.orderStatus === 'pending' ? 'bg-blue-500 hover:bg-blue-600 text-white' : order.orderStatus === 'preparing' ? 'bg-green-500 hover:bg-green-600 text-white' : 'bg-gray-500 hover:bg-gray-600 text-white'}`}>
            {updating ? '...' : STATUS_LABELS[order.orderStatus]}
          </button>
        )}
      </div>
    </div>
  );
};

const KitchenDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');

  const fetchOrders = useCallback(async () => {
    try {
      const [pending, preparing, ready] = await Promise.all([
        api.get('/orders?status=pending&limit=50'),
        api.get('/orders?status=preparing&limit=50'),
        api.get('/orders?status=ready&limit=50'),
      ]);
      setOrders([...pending.data.data, ...preparing.data.data, ...ready.data.data]);
    } catch { }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    fetchOrders();
    const socket = getSocket();
    socket.on('new_order', (order) => { setOrders(prev => [order, ...prev]); toast.success(`New order: ${order.pickupCode}`); });
    socket.on('order_status_update', ({ orderId, status }) => {
      setOrders(prev => prev.map(o => o._id === orderId ? { ...o, orderStatus: status } : o).filter(o => ['pending', 'preparing', 'ready'].includes(o.orderStatus)));
    });
    return () => { socket.off('new_order'); socket.off('order_status_update'); };
  }, [fetchOrders]);

  const handleStatusChange = (orderId, newStatus) => {
    setOrders(prev => prev.map(o => o._id === orderId ? { ...o, orderStatus: newStatus } : o).filter(o => ['pending', 'preparing', 'ready'].includes(o.orderStatus)));
  };

  const tabs = [
    { key: 'pending', label: 'Pending', icon: MdPendingActions, color: 'text-yellow-500' },
    { key: 'preparing', label: 'Preparing', icon: MdOutdoorGrill, color: 'text-blue-500' },
    { key: 'ready', label: 'Ready', icon: MdDoneAll, color: 'text-green-500' },
  ];

  const filtered = orders.filter(o => o.orderStatus === activeTab);

  if (loading) return <DashboardLayout links={kitchenLinks}><PageLoader /></DashboardLayout>;

  return (
    <DashboardLayout links={kitchenLinks}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Kitchen Dashboard</h1>
          <button onClick={fetchOrders} className="btn-secondary flex items-center gap-2 py-2"><FiRefreshCw size={16} /> Refresh</button>
        </div>
        <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
          {tabs.map(({ key, label, icon: Icon, color }) => {
            const count = orders.filter(o => o.orderStatus === key).length;
            return (
              <button key={key} onClick={() => setActiveTab(key)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === key ? 'border-purple-600 text-purple-600' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}>
                <Icon size={18} className={activeTab === key ? 'text-purple-600' : color} />
                {label}
                {count > 0 && <span className={`px-1.5 py-0.5 rounded-full text-xs font-bold ${activeTab === key ? 'bg-purple-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'}`}>{count}</span>}
              </button>
            );
          })}
        </div>
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <MdDoneAll size={48} className="mx-auto mb-3 opacity-30" />
            <p>No {activeTab} orders</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map(order => <OrderCard key={order._id} order={order} onStatusChange={handleStatusChange} />)}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default KitchenDashboard;
