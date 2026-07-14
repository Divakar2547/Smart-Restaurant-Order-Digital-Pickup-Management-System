import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import StatCard from '../../components/ui/StatCard';
import { PageLoader } from '../../components/ui/LoadingSpinner';
import api from '../../utils/api';
import { formatCurrency } from '../../utils/helpers';
import { cashierLinks } from '../../utils/navLinks';
import { FiShoppingBag, FiDollarSign, FiClock, FiCheckCircle } from 'react-icons/fi';
import { MdShoppingCart } from 'react-icons/md';
import { Link } from 'react-router-dom';

const CashierDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    api.get(`/orders?date=${today}&limit=100`).then(({ data }) => { setOrders(data.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const stats = {
    total: orders.length,
    revenue: orders.filter(o => o.orderStatus !== 'cancelled').reduce((s, o) => s + o.totalAmount, 0),
    pending: orders.filter(o => o.orderStatus === 'pending').length,
    delivered: orders.filter(o => o.orderStatus === 'delivered').length,
  };

  if (loading) return <DashboardLayout links={cashierLinks}><PageLoader /></DashboardLayout>;

  return (
    <DashboardLayout links={cashierLinks}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Cashier Dashboard</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Today's overview</p>
          </div>
          <Link to="/cashier/create-order" className="btn-primary flex items-center gap-2">
            <MdShoppingCart size={18} /> New Order
          </Link>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Today's Orders" value={stats.total} icon={FiShoppingBag} color="purple" />
          <StatCard title="Today's Revenue" value={formatCurrency(stats.revenue)} icon={FiDollarSign} color="green" />
          <StatCard title="Pending" value={stats.pending} icon={FiClock} color="blue" />
          <StatCard title="Delivered" value={stats.delivered} icon={FiCheckCircle} color="purple" />
        </div>
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Recent Orders</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  {['Pickup Code', 'Customer', 'Items', 'Total', 'Status'].map(h => (
                    <th key={h} className="text-left py-3 px-4 font-semibold text-gray-600 dark:text-gray-400">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {orders.slice(0, 10).map(order => (
                  <tr key={order._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="py-3 px-4 font-mono font-bold text-purple-600">{order.pickupCode}</td>
                    <td className="py-3 px-4">{order.customerName}</td>
                    <td className="py-3 px-4 text-gray-500">{order.orderedItems.length} items</td>
                    <td className="py-3 px-4 font-medium">{formatCurrency(order.totalAmount)}</td>
                    <td className="py-3 px-4"><span className={`badge-${order.orderStatus}`}>{order.orderStatus}</span></td>
                  </tr>
                ))}
                {orders.length === 0 && <tr><td colSpan={5} className="py-8 text-center text-gray-400">No orders today</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CashierDashboard;
