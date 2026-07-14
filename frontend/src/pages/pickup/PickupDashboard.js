import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { PageLoader } from '../../components/ui/LoadingSpinner';
import StatusBadge from '../../components/ui/StatusBadge';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { formatCurrency, formatDateTime } from '../../utils/helpers';
import { pickupLinks } from '../../utils/navLinks';
import { MdQrCodeScanner } from 'react-icons/md';
import { FiSearch, FiCheckCircle, FiPackage } from 'react-icons/fi';

const PickupDashboard = () => {
  const [code, setCode] = useState('');
  const [order, setOrder] = useState(null);
  const [verifying, setVerifying] = useState(false);
  const [delivering, setDelivering] = useState(false);
  const [recentDeliveries, setRecentDeliveries] = useState([]);

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    api.get(`/orders?status=delivered&date=${today}&limit=10`).then(({ data }) => setRecentDeliveries(data.data)).catch(() => {});
  }, []);

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!code.trim()) return;
    setVerifying(true);
    setOrder(null);
    try {
      const { data } = await api.post('/orders/verify-code', { code: code.trim() });
      setOrder(data.data);
    } catch (error) { toast.error(error.response?.data?.message || 'Invalid pickup code'); }
    finally { setVerifying(false); }
  };

  const handleDeliver = async () => {
    if (!order) return;
    setDelivering(true);
    try {
      await api.put(`/orders/${order._id}/deliver`);
      toast.success('Order delivered successfully!');
      setRecentDeliveries(prev => [{ ...order, orderStatus: 'delivered' }, ...prev.slice(0, 9)]);
      setOrder(null);
      setCode('');
    } catch (error) { toast.error(error.response?.data?.message || 'Failed to deliver'); }
    finally { setDelivering(false); }
  };

  return (
    <DashboardLayout links={pickupLinks}>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Pickup Counter</h1>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card space-y-4">
            <h2 className="text-lg font-semibold flex items-center gap-2"><MdQrCodeScanner size={22} className="text-purple-600" /> Verify Pickup Code</h2>
            <form onSubmit={handleVerify} className="flex gap-3">
              <div className="relative flex-1">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input className="input pl-10 font-mono text-lg tracking-widest" placeholder="Enter 6-digit code" value={code}
                  onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))} maxLength={6} />
              </div>
              <button type="submit" disabled={verifying || code.length !== 6} className="btn-primary px-6">
                {verifying ? '...' : 'Verify'}
              </button>
            </form>
            {order && (
              <div className="border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-2 text-green-600 dark:text-green-400 font-semibold">
                  <FiCheckCircle size={20} /> Order Found!
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><p className="text-gray-500">Customer</p><p className="font-medium">{order.customerName}</p></div>
                  <div><p className="text-gray-500">Phone</p><p className="font-medium">{order.customerPhone}</p></div>
                  <div><p className="text-gray-500">Status</p><StatusBadge status={order.orderStatus} /></div>
                  <div><p className="text-gray-500">Total</p><p className="font-bold text-purple-600">{formatCurrency(order.totalAmount)}</p></div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Ordered Items:</p>
                  <div className="space-y-1">
                    {order.orderedItems.map((item, i) => (
                      <div key={i} className="flex justify-between text-sm">
                        <span>× {item.quantity} {item.foodName}</span>
                        <span className="text-gray-500">{formatCurrency(item.subtotal)}</span>
                      </div>
                    ))}
                  </div>
                </div>
                {order.qrCode && <img src={order.qrCode} alt="QR" className="w-24 h-24 rounded-lg" />}
                <button onClick={handleDeliver} disabled={delivering || order.orderStatus !== 'ready'}
                  className={`w-full py-3 rounded-lg font-semibold transition-colors ${order.orderStatus === 'ready' ? 'bg-green-500 hover:bg-green-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'}`}>
                  {delivering ? 'Processing...' : order.orderStatus === 'ready' ? '✅ Mark as Delivered' : `Order is ${order.orderStatus} - Not ready yet`}
                </button>
              </div>
            )}
          </div>
          <div className="card space-y-4">
            <h2 className="text-lg font-semibold flex items-center gap-2"><FiPackage size={20} className="text-purple-600" /> Today's Deliveries</h2>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {recentDeliveries.map(d => (
                <div key={d._id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div>
                    <p className="font-mono font-bold text-purple-600 text-sm">{d.pickupCode}</p>
                    <p className="text-sm font-medium">{d.customerName}</p>
                    <p className="text-xs text-gray-400">{formatDateTime(d.createdAt)}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-sm">{formatCurrency(d.totalAmount)}</p>
                    <StatusBadge status={d.orderStatus} />
                  </div>
                </div>
              ))}
              {recentDeliveries.length === 0 && <p className="text-center text-gray-400 py-8">No deliveries today</p>}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PickupDashboard;
