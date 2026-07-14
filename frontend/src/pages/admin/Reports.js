import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { PageLoader } from '../../components/ui/LoadingSpinner';
import { adminLinks } from '../../utils/navLinks';
import api from '../../utils/api';
import { formatCurrency, formatDate } from '../../utils/helpers';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Reports = () => {
  const [period, setPeriod] = useState('daily');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try { const res = await api.get(`/admin/reports/sales?period=${period}`); setData(res.data.data); }
      catch { }
      finally { setLoading(false); }
    };
    fetch();
  }, [period]);

  const labels = data.map(d => period === 'daily' ? `${d._id.day}/${d._id.month}` : period === 'weekly' ? `W${d._id.week}` : `${d._id.month}/${d._id.year}`);
  const chartData = {
    labels,
    datasets: [
      { label: 'Revenue (₹)', data: data.map(d => d.revenue), backgroundColor: 'rgba(147,51,234,0.8)', borderRadius: 6 },
      { label: 'Orders', data: data.map(d => d.orders), backgroundColor: 'rgba(59,130,246,0.8)', borderRadius: 6 },
    ]
  };

  const totalRevenue = data.reduce((s, d) => s + d.revenue, 0);
  const totalOrders = data.reduce((s, d) => s + d.orders, 0);

  if (loading) return <DashboardLayout links={adminLinks}><PageLoader /></DashboardLayout>;

  return (
    <DashboardLayout links={adminLinks}>
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Sales Reports</h1>
          <div className="flex gap-2">
            {['daily', 'weekly', 'monthly'].map(p => (
              <button key={p} onClick={() => setPeriod(p)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${period === p ? 'bg-purple-600 text-white' : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
                {p}
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="card text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Revenue</p>
            <p className="text-3xl font-bold text-purple-600 mt-1">{formatCurrency(totalRevenue)}</p>
          </div>
          <div className="card text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Orders</p>
            <p className="text-3xl font-bold text-blue-500 mt-1">{totalOrders}</p>
          </div>
        </div>
        <div className="card">
          <h2 className="text-lg font-semibold mb-4 capitalize">{period} Sales Report</h2>
          <Bar data={chartData} options={{ responsive: true, plugins: { legend: { position: 'top' } } }} />
        </div>
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 px-4 font-semibold text-gray-600 dark:text-gray-400">Period</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-600 dark:text-gray-400">Orders</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-600 dark:text-gray-400">Revenue</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-600 dark:text-gray-400">Avg Order</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {data.map((d, i) => (
                <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="py-3 px-4">{labels[i]}</td>
                  <td className="py-3 px-4 text-right">{d.orders}</td>
                  <td className="py-3 px-4 text-right font-medium text-green-600">{formatCurrency(d.revenue)}</td>
                  <td className="py-3 px-4 text-right text-gray-500">{formatCurrency(d.orders ? d.revenue / d.orders : 0)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Reports;
