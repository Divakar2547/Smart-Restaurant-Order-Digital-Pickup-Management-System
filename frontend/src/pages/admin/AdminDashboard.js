import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import StatCard from '../../components/ui/StatCard';
import { PageLoader } from '../../components/ui/LoadingSpinner';
import api from '../../utils/api';
import { formatCurrency } from '../../utils/helpers';
import { adminLinks } from '../../utils/navLinks';
import { FiShoppingBag, FiUsers, FiDollarSign, FiUserCheck, FiTrendingUp } from 'react-icons/fi';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Link } from 'react-router-dom';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [salesData, setSalesData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, salesRes] = await Promise.all([
          api.get('/admin/dashboard'),
          api.get('/admin/reports/sales?period=daily')
        ]);
        setStats(statsRes.data.data);
        setSalesData(salesRes.data.data);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    fetchData();
  }, []);

  const chartData = {
    labels: salesData.slice(-14).map(d => `${d._id.day}/${d._id.month}`),
    datasets: [{
      label: 'Revenue (₹)',
      data: salesData.slice(-14).map(d => d.revenue),
      borderColor: '#9333ea',
      backgroundColor: 'rgba(147,51,234,0.1)',
      fill: true,
      tension: 0.4,
    }]
  };

  if (loading) return <DashboardLayout links={adminLinks}><PageLoader /></DashboardLayout>;

  return (
    <DashboardLayout links={adminLinks}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Welcome back! Here's what's happening today.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          <StatCard title="Total Orders" value={stats?.totalOrders || 0} icon={FiShoppingBag} color="purple" subtitle={`${stats?.todayOrders || 0} today`} />
          <StatCard title="Total Revenue" value={formatCurrency(stats?.totalRevenue)} icon={FiDollarSign} color="green" subtitle={`${formatCurrency(stats?.todayRevenue)} today`} />
          <StatCard title="Customers" value={stats?.totalCustomers || 0} icon={FiUsers} color="blue" />
          <StatCard title="Staff Members" value={stats?.totalStaff || 0} icon={FiUserCheck} color="purple" />
          <StatCard title="Today's Orders" value={stats?.todayOrders || 0} icon={FiTrendingUp} color="red" />
        </div>
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Revenue Trend (Last 14 Days)</h2>
          <Line data={chartData} options={{ responsive: true, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { to: '/admin/staff', label: 'Manage Staff', desc: 'Add or manage cashier, kitchen & pickup staff', color: 'bg-blue-500' },
            { to: '/admin/categories', label: 'Food Categories', desc: 'Manage food categories for the menu', color: 'bg-green-500' },
            { to: '/admin/reports', label: 'View Reports', desc: 'Daily, weekly and monthly sales reports', color: 'bg-purple-500' },
          ].map(item => (
            <Link key={item.to} to={item.to} className="card hover:shadow-md transition-shadow group">
              <div className={`w-10 h-10 ${item.color} rounded-lg flex items-center justify-center text-white mb-3`}>
                <FiTrendingUp size={20} />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-purple-600 transition-colors">{item.label}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{item.desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
