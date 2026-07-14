require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Category = require('./models/Category');
const Food = require('./models/Food');
const Settings = require('./models/Settings');

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  // Clear existing data
  await Promise.all([User.deleteMany(), Category.deleteMany(), Food.deleteMany(), Settings.deleteMany()]);
  console.log('Cleared existing data');

  // Create users
  const users = await User.create([
    { name: 'Admin User', email: 'admin@restaurant.com', phone: '+919876543210', password: 'admin123', role: 'admin' },
    { name: 'John Cashier', email: 'cashier@restaurant.com', phone: '+919876543211', password: 'cashier123', role: 'cashier' },
    { name: 'Chef Kumar', email: 'kitchen@restaurant.com', phone: '+919876543212', password: 'kitchen123', role: 'kitchen' },
    { name: 'Pickup Staff', email: 'pickup@restaurant.com', phone: '+919876543213', password: 'pickup123', role: 'pickup' },
    { name: 'Test Customer', email: 'customer@restaurant.com', phone: '+919876543214', password: 'customer123', role: 'customer' },
  ]);
  console.log('Created users');

  // Create categories
  const categories = await Category.create([
    { categoryName: 'Starters', description: 'Appetizers and starters' },
    { categoryName: 'Main Course', description: 'Main dishes' },
    { categoryName: 'Breads', description: 'Indian breads' },
    { categoryName: 'Rice & Biryani', description: 'Rice dishes' },
    { categoryName: 'Desserts', description: 'Sweet dishes' },
    { categoryName: 'Beverages', description: 'Drinks and juices' },
  ]);
  console.log('Created categories');

  // Create food items
  const [starters, main, breads, rice, desserts, beverages] = categories;
  await Food.create([
    { foodName: 'Paneer Tikka', category: starters._id, description: 'Grilled cottage cheese with spices', price: 220, available: true },
    { foodName: 'Chicken 65', category: starters._id, description: 'Spicy fried chicken', price: 280, available: true },
    { foodName: 'Veg Spring Rolls', category: starters._id, description: 'Crispy vegetable rolls', price: 160, available: true },
    { foodName: 'Butter Chicken', category: main._id, description: 'Creamy tomato-based chicken curry', price: 320, available: true },
    { foodName: 'Paneer Butter Masala', category: main._id, description: 'Rich paneer curry', price: 280, available: true },
    { foodName: 'Dal Makhani', category: main._id, description: 'Slow-cooked black lentils', price: 220, available: true },
    { foodName: 'Chicken Biryani', category: rice._id, description: 'Aromatic basmati rice with chicken', price: 350, available: true },
    { foodName: 'Veg Biryani', category: rice._id, description: 'Fragrant vegetable biryani', price: 260, available: true },
    { foodName: 'Butter Naan', category: breads._id, description: 'Soft leavened bread with butter', price: 50, available: true },
    { foodName: 'Garlic Naan', category: breads._id, description: 'Naan with garlic and herbs', price: 60, available: true },
    { foodName: 'Gulab Jamun', category: desserts._id, description: 'Soft milk dumplings in sugar syrup', price: 80, available: true },
    { foodName: 'Mango Lassi', category: beverages._id, description: 'Chilled mango yogurt drink', price: 90, available: true },
    { foodName: 'Masala Chai', category: beverages._id, description: 'Spiced Indian tea', price: 40, available: true },
  ]);
  console.log('Created food items');

  // Create settings
  await Settings.create({
    restaurantName: 'Smart Restaurant',
    address: '123 Food Street, Bangalore, Karnataka 560001',
    phone: '+91 80 1234 5678',
    email: 'info@smartrestaurant.com',
    gstNumber: '29ABCDE1234F1Z5',
    gstRate: 5,
    currency: 'INR',
    currencySymbol: '₹',
    openTime: '09:00',
    closeTime: '22:00',
  });
  console.log('Created settings');

  console.log('\n✅ Seed completed successfully!');
  console.log('\nLogin credentials:');
  console.log('  Admin:    admin@restaurant.com    / admin123');
  console.log('  Cashier:  cashier@restaurant.com  / cashier123');
  console.log('  Kitchen:  kitchen@restaurant.com  / kitchen123');
  console.log('  Pickup:   pickup@restaurant.com   / pickup123');
  console.log('  Customer: customer@restaurant.com / customer123');

  process.exit(0);
};

seed().catch(err => { console.error(err); process.exit(1); });
