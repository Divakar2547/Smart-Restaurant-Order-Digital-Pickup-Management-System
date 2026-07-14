export const formatCurrency = (amount, symbol = '₹') => `${symbol}${Number(amount || 0).toFixed(2)}`;

export const formatDate = (date) => new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

export const formatDateTime = (date) => new Date(date).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

export const getStatusBadgeClass = (status) => {
  const map = { pending: 'badge-pending', preparing: 'badge-preparing', ready: 'badge-ready', delivered: 'badge-delivered', cancelled: 'badge-cancelled' };
  return map[status] || 'badge-pending';
};

export const getRoleDashboard = (role) => {
  const map = { admin: '/admin', cashier: '/cashier', kitchen: '/kitchen', pickup: '/pickup', customer: '/customer' };
  return map[role] || '/login';
};
