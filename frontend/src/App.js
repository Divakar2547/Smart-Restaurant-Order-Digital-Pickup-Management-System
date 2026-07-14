import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/layout/ProtectedRoute';
import DashboardLayout from './components/layout/DashboardLayout';
import { adminLinks } from './utils/navLinks';
import api from './utils/api';
import { formatDateTime } from './utils/helpers';

// Public
import Login from './pages/public/Login';
import Register from './pages/public/Register';
import ForgotPassword from './pages/public/ForgotPassword';

// Admin
import AdminDashboard from './pages/admin/AdminDashboard';
import StaffManagement from './pages/admin/StaffManagement';
import CategoryManagement from './pages/admin/CategoryManagement';
import Reports from './pages/admin/Reports';
import Settings from './pages/admin/Settings';

// Cashier
import CashierDashboard from './pages/cashier/CashierDashboard';
import FoodMenu from './pages/cashier/FoodMenu';
import AddFood from './pages/cashier/AddFood';
import CreateOrder from './pages/cashier/CreateOrder';
import OrderHistory from './pages/cashier/OrderHistory';

// Kitchen
import KitchenDashboard from './pages/kitchen/KitchenDashboard';

// Pickup
import PickupDashboard from './pages/pickup/PickupDashboard';
import PickupHistory from './pages/pickup/PickupHistory';

// Customer
import CustomerDashboard from './pages/customer/CustomerDashboard';
import CustomerProfile from './pages/customer/CustomerProfile';
import CustomerOrders from './pages/customer/CustomerOrders';
import Notifications from './pages/customer/Notifications';

const AdminCustomers = () => {
  const [customers, setCustomers] = useState([]);
  useEffect(() => {
    api.get('/admin/customers').then(({ data }) => setCustomers(data.data)).catch(() => {});
  }, []);
  return (
    <DashboardLayout links={adminLinks}>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Customers</h1>
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                {['Name', 'Email', 'Phone', 'Joined'].map(h => (
                  <th key={h} className="text-left py-3 px-4 font-semibold text-gray-600 dark:text-gray-400">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {customers.map(c => (
                <tr key={c._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="py-3 px-4 font-medium">{c.name}</td>
                  <td className="py-3 px-4 text-gray-500">{c.email}</td>
                  <td className="py-3 px-4 text-gray-500">{c.phone}</td>
                  <td className="py-3 px-4 text-gray-500 text-xs">{formatDateTime(c.createdAt)}</td>
                </tr>
              ))}
              {customers.length === 0 && (
                <tr><td colSpan={4} className="py-8 text-center text-gray-400">No customers yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: { borderRadius: '10px', background: '#333', color: '#fff' },
            }}
          />
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            {/* Admin */}
            <Route path="/admin" element={<ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/staff" element={<ProtectedRoute roles={['admin']}><StaffManagement /></ProtectedRoute>} />
            <Route path="/admin/customers" element={<ProtectedRoute roles={['admin']}><AdminCustomers /></ProtectedRoute>} />
            <Route path="/admin/categories" element={<ProtectedRoute roles={['admin']}><CategoryManagement /></ProtectedRoute>} />
            <Route path="/admin/reports" element={<ProtectedRoute roles={['admin']}><Reports /></ProtectedRoute>} />
            <Route path="/admin/settings" element={<ProtectedRoute roles={['admin']}><Settings /></ProtectedRoute>} />

            {/* Cashier */}
            <Route path="/cashier" element={<ProtectedRoute roles={['cashier', 'admin']}><CashierDashboard /></ProtectedRoute>} />
            <Route path="/cashier/menu" element={<ProtectedRoute roles={['cashier', 'admin']}><FoodMenu /></ProtectedRoute>} />
            <Route path="/cashier/add-food" element={<ProtectedRoute roles={['cashier', 'admin']}><AddFood /></ProtectedRoute>} />
            <Route path="/cashier/create-order" element={<ProtectedRoute roles={['cashier', 'admin']}><CreateOrder /></ProtectedRoute>} />
            <Route path="/cashier/orders" element={<ProtectedRoute roles={['cashier', 'admin']}><OrderHistory /></ProtectedRoute>} />

            {/* Kitchen */}
            <Route path="/kitchen" element={<ProtectedRoute roles={['kitchen', 'admin']}><KitchenDashboard /></ProtectedRoute>} />

            {/* Pickup */}
            <Route path="/pickup" element={<ProtectedRoute roles={['pickup', 'admin']}><PickupDashboard /></ProtectedRoute>} />
            <Route path="/pickup/verify" element={<ProtectedRoute roles={['pickup', 'admin']}><PickupDashboard /></ProtectedRoute>} />
            <Route path="/pickup/history" element={<ProtectedRoute roles={['pickup', 'admin']}><PickupHistory /></ProtectedRoute>} />

            {/* Customer */}
            <Route path="/customer" element={<ProtectedRoute roles={['customer']}><CustomerDashboard /></ProtectedRoute>} />
            <Route path="/customer/profile" element={<ProtectedRoute roles={['customer']}><CustomerProfile /></ProtectedRoute>} />
            <Route path="/customer/orders" element={<ProtectedRoute roles={['customer']}><CustomerOrders /></ProtectedRoute>} />
            <Route path="/customer/notifications" element={<ProtectedRoute roles={['customer']}><Notifications /></ProtectedRoute>} />

            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
