import { FiUserCheck, FiTrendingUp } from 'react-icons/fi';
import { MdRestaurantMenu, MdPeople, MdBarChart, MdSettings, MdDashboard, MdShoppingCart, MdAddCircle, MdHistory, MdQrCodeScanner, MdPerson, MdNotifications } from 'react-icons/md';

export const adminLinks = [
  { to: '/admin', icon: MdDashboard, label: 'Dashboard' },
  { to: '/admin/staff', icon: FiUserCheck, label: 'Staff Management' },
  { to: '/admin/customers', icon: MdPeople, label: 'Customers' },
  { to: '/admin/categories', icon: MdRestaurantMenu, label: 'Food Categories' },
  { to: '/admin/reports', icon: MdBarChart, label: 'Reports' },
  { to: '/admin/settings', icon: MdSettings, label: 'Settings' },
];

export const cashierLinks = [
  { to: '/cashier', icon: MdDashboard, label: 'Dashboard' },
  { to: '/cashier/menu', icon: MdRestaurantMenu, label: 'Food Menu' },
  { to: '/cashier/add-food', icon: MdAddCircle, label: 'Add Food' },
  { to: '/cashier/create-order', icon: MdShoppingCart, label: 'Create Order' },
  { to: '/cashier/orders', icon: MdHistory, label: 'Order History' },
];

export const kitchenLinks = [
  { to: '/kitchen', icon: MdDashboard, label: 'Dashboard' },
];

export const pickupLinks = [
  { to: '/pickup', icon: MdDashboard, label: 'Dashboard' },
  { to: '/pickup/history', icon: MdHistory, label: 'Pickup History' },
];

export const customerLinks = [
  { to: '/customer', icon: MdDashboard, label: 'Dashboard' },
  { to: '/customer/profile', icon: MdPerson, label: 'Profile' },
  { to: '/customer/orders', icon: MdHistory, label: 'Order History' },
  { to: '/customer/notifications', icon: MdNotifications, label: 'Notifications' },
];
