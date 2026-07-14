import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import StatusBadge from '../../components/ui/StatusBadge';
import Pagination from '../../components/ui/Pagination';
import { PageLoader } from '../../components/ui/LoadingSpinner';
import { pickupLinks } from '../../utils/navLinks';
import api from '../../utils/api';
import { formatCurrency, formatDateTime } from '../../utils/helpers';

const PickupHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [date, setDate] = useState('');

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({ status: 'delivered', page, limit: 20 });
        if (date) params.append('date', date);
        const { data } = await api.get(`/orders?${params}`);
        setOrders(data.data);
        setPages(data.pages);
      } catch { }
      finally { setLoading(false); }
    };
    fetch();
  }, [page, date]);

  return (
    <DashboardLayout links={pickupLinks}>
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Pickup History</h1>
          <input type="date" className="input w-auto" value={date} onChange={e => { setDate(e.target.value); setPage(1); }} />
        </div>
        <div className="card overflow-x-auto">
          {loading ? <PageLoader /> : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  {['Code', 'Customer', 'Phone', 'Items', 'Total', 'Status', 'Delivered At'].map(h => (
                    <th key={h} className="text-left py-3 px-4 font-semibold text-gray-600 dark:text-gray-400">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {orders.map(order => (
                  <tr key={order._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="py-3 px-4 font-mono font-bold text-purple-600">{order.pickupCode}</td>
                    <td className="py-3 px-4 font-medium">{order.customerName}</td>
                    <td className="py-3 px-4 text-gray-500">{order.customerPhone}</td>
                    <td className="py-3 px-4 text-gray-500">{order.orderedItems.length}</td>
                    <td className="py-3 px-4 font-medium">{formatCurrency(order.totalAmount)}</td>
                    <td className="py-3 px-4"><StatusBadge status={order.orderStatus} /></td>
                    <td className="py-3 px-4 text-gray-500 text-xs">{order.deliveredAt ? formatDateTime(order.deliveredAt) : '-'}</td>
                  </tr>
                ))}
                {orders.length === 0 && <tr><td colSpan={7} className="py-8 text-center text-gray-400">No deliveries found</td></tr>}
              </tbody>
            </table>
          )}
          <Pagination page={page} pages={pages} onPageChange={setPage} />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PickupHistory;
