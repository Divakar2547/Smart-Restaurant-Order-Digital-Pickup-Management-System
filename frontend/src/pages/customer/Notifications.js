import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { PageLoader } from '../../components/ui/LoadingSpinner';
import { customerLinks } from '../../utils/navLinks';
import api from '../../utils/api';
import { formatDateTime } from '../../utils/helpers';
import { FiBell, FiCheck, FiCheckCircle } from 'react-icons/fi';

const typeIcons = { order_placed: '🛍️', order_preparing: '👨‍🍳', order_ready: '✅', order_delivered: '🎉', general: '📢' };

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try { const { data } = await api.get('/customer/notifications'); setNotifications(data.data); }
    catch { }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchNotifications(); }, []);

  const markRead = async (id) => {
    await api.put(`/customer/notifications/${id}/read`);
    setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
  };

  const markAllRead = async () => {
    await api.put('/customer/notifications/read-all');
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const unread = notifications.filter(n => !n.isRead).length;

  if (loading) return <DashboardLayout links={customerLinks}><PageLoader /></DashboardLayout>;

  return (
    <DashboardLayout links={customerLinks}>
      <div className="max-w-2xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Notifications</h1>
            {unread > 0 && <p className="text-sm text-gray-500 mt-1">{unread} unread</p>}
          </div>
          {unread > 0 && (
            <button onClick={markAllRead} className="btn-secondary flex items-center gap-2 py-2 text-sm">
              <FiCheckCircle size={16} /> Mark all read
            </button>
          )}
        </div>
        <div className="space-y-2">
          {notifications.map(n => (
            <div key={n._id} className={`card flex items-start gap-4 transition-all ${!n.isRead ? 'border-l-4 border-l-purple-600' : ''}`}>
              <span className="text-2xl">{typeIcons[n.type] || '📢'}</span>
              <div className="flex-1 min-w-0">
                <p className={`text-sm ${!n.isRead ? 'font-semibold text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'}`}>{n.message}</p>
                <p className="text-xs text-gray-400 mt-1">{formatDateTime(n.createdAt)}</p>
              </div>
              {!n.isRead && (
                <button onClick={() => markRead(n._id)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 flex-shrink-0">
                  <FiCheck size={16} />
                </button>
              )}
            </div>
          ))}
          {notifications.length === 0 && (
            <div className="card text-center py-16">
              <FiBell size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
              <p className="text-gray-400">No notifications yet</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Notifications;
