import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import StatusBadge from '../../components/ui/StatusBadge';
import { PageLoader } from '../../components/ui/LoadingSpinner';
import api from '../../utils/api';
import { getSocket } from '../../hooks/useSocket';
import { formatCurrency } from '../../utils/helpers';
import { customerLinks } from '../../utils/navLinks';
import { useAuth } from '../../context/AuthContext';
import { FiPackage, FiSearch, FiCheckCircle, FiShoppingCart, FiPlus, FiMinus, FiTrash2, FiX, FiShield, FiRefreshCw } from 'react-icons/fi';
import { MdQrCodeScanner, MdRestaurantMenu } from 'react-icons/md';
import { motion } from 'framer-motion';
import logo from '../../assets/img1.jpeg';
import heroBg from '../../assets/img2.jpeg';
import toast from 'react-hot-toast';

const STATUS_STEPS = ['pending', 'preparing', 'ready', 'delivered'];

const PickupCounter = () => {
  const [code, setCode] = useState('');
  const [order, setOrder] = useState(null);
  const [verifying, setVerifying] = useState(false);

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

  return (
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
          <div className="flex items-center gap-2 text-green-600 font-semibold"><FiCheckCircle size={20} /> Order Found!</div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div><p className="text-gray-500">Customer</p><p className="font-medium">{order.customerName}</p></div>
            <div><p className="text-gray-500">Phone</p><p className="font-medium">{order.customerPhone}</p></div>
            <div><p className="text-gray-500">Status</p><StatusBadge status={order.orderStatus} /></div>
            <div><p className="text-gray-500">Total</p><p className="font-bold text-purple-600">{formatCurrency(order.totalAmount)}</p></div>
          </div>
          <div className="space-y-1">
            {order.orderedItems.map((item, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span>× {item.quantity} {item.foodName}</span>
                <span className="text-gray-500">{formatCurrency(item.subtotal)}</span>
              </div>
            ))}
          </div>
          <p className={`text-sm font-medium text-center py-2 rounded-lg ${order.orderStatus === 'ready' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
            {order.orderStatus === 'ready' ? '✅ Order is Ready for Pickup!' : `⏳ Order is ${order.orderStatus} - Please wait`}
          </p>
        </div>
      )}
    </div>
  );
};

const OrderTracker = ({ order }) => {
  const currentStep = STATUS_STEPS.indexOf(order.orderStatus);
  return (
    <div className="card space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Current Order</h2>
        <StatusBadge status={order.orderStatus} />
      </div>
      <div className="text-center py-2">
        <p className="text-sm text-gray-500">Your Pickup Code</p>
        <p className="text-5xl font-bold font-mono text-purple-600 tracking-widest mt-1">{order.pickupCode}</p>
        {order.qrCode && <img src={order.qrCode} alt="QR" className="w-28 h-28 mx-auto mt-3 rounded-lg" />}
      </div>
      <div className="flex items-center justify-between relative">
        <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-200 dark:bg-gray-700 z-0" />
        <div className="absolute top-4 left-0 h-0.5 bg-purple-600 z-0 transition-all duration-500" style={{ width: `${(currentStep / (STATUS_STEPS.length - 1)) * 100}%` }} />
        {STATUS_STEPS.map((step, i) => (
          <div key={step} className="flex flex-col items-center z-10">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${i <= currentStep ? 'bg-purple-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-400'}`}>
              {i < currentStep ? '✓' : i + 1}
            </div>
            <span className={`text-xs mt-1 capitalize ${i <= currentStep ? 'text-purple-600 font-medium' : 'text-gray-400'}`}>{step}</span>
          </div>
        ))}
      </div>
      <div className="space-y-1 border-t border-gray-100 dark:border-gray-700 pt-3">
        {order.orderedItems.map((item, i) => (
          <div key={i} className="flex justify-between text-sm">
            <span>× {item.quantity} {item.foodName}</span>
            <span className="text-gray-500">{formatCurrency(item.subtotal)}</span>
          </div>
        ))}
        <div className="flex justify-between font-bold text-base pt-2 border-t border-gray-100 dark:border-gray-700">
          <span>Total</span><span className="text-purple-600">{formatCurrency(order.totalAmount)}</span>
        </div>
      </div>
    </div>
  );
};

// Cart drawer
const CartDrawer = ({ cart, onClose, onQtyChange, onRemove, onPlaceOrder, placing }) => {
  const subtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const gstAmount = subtotal * 0.05;
  const total = subtotal + gstAmount;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-white dark:bg-gray-800 h-full flex flex-col shadow-2xl">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-bold flex items-center gap-2"><FiShoppingCart className="text-purple-600" /> Your Cart</h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"><FiX size={20} /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.map(item => (
            <div key={item._id} className="flex items-center gap-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3">
              {item.image
                ? <img src={item.image} alt={item.foodName} className="w-14 h-14 rounded-lg object-cover flex-shrink-0" />
                : <div className="w-14 h-14 rounded-lg bg-gray-200 dark:bg-gray-600 flex items-center justify-center text-2xl flex-shrink-0">🍽️</div>}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{item.foodName}</p>
                <p className="text-purple-600 text-sm font-semibold">{formatCurrency(item.price)}</p>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => onQtyChange(item._id, -1)} className="w-7 h-7 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center hover:bg-purple-100"><FiMinus size={12} /></button>
                <span className="w-6 text-center text-sm font-bold">{item.quantity}</span>
                <button onClick={() => onQtyChange(item._id, 1)} className="w-7 h-7 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center hover:bg-purple-100"><FiPlus size={12} /></button>
              </div>
              <button onClick={() => onRemove(item._id)} className="p-1 text-red-400 hover:text-red-600"><FiTrash2 size={16} /></button>
            </div>
          ))}
        </div>
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-3">
          <div className="space-y-1 text-sm">
            <div className="flex justify-between text-gray-500"><span>Subtotal</span><span>{formatCurrency(subtotal)}</span></div>
            <div className="flex justify-between text-gray-500"><span>GST (5%)</span><span>{formatCurrency(gstAmount)}</span></div>
            <div className="flex justify-between font-bold text-base"><span>Total</span><span className="text-purple-600">{formatCurrency(total)}</span></div>
          </div>
          <button onClick={onPlaceOrder} disabled={placing} className="btn-primary w-full py-3 text-base">
            {placing ? 'Placing Order...' : `Place Order • ${formatCurrency(total)}`}
          </button>
        </div>
      </div>
    </div>
  );
};

const fade = { hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0 } };

const FEATURES = [
  { icon: '🛒', title: 'Easy Ordering', desc: 'Order your favorite food with just a few clicks' },
  { icon: '🔢', title: 'Digital Pickup Code', desc: 'A unique pickup code — secure and fast pickup' },
  { icon: '📡', title: 'Real-time Updates', desc: 'Track your order status in real-time' },
  { icon: '🛡️', title: 'Secure & Reliable', desc: 'Always safe with us' },
];

const HeroSection = ({ user, onViewMenu, onTrackOrder }) => (
  <motion.div
    variants={{ hidden: {}, show: { transition: { staggerChildren: 0.12 } } }}
    initial="hidden" animate="show"
    className="rounded-3xl overflow-hidden"
    style={{
      backgroundImage: `linear-gradient(135deg, rgba(46,16,101,0.45) 0%, rgba(76,29,149,0.35) 45%, rgba(109,40,217,0.30) 100%), url(${heroBg})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      minHeight: '420px',
    }}
  >
    {/* Top Nav Bar */}
    <div className="flex items-center justify-between px-8 pt-6 pb-2">
      <motion.div variants={fade} className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full border-2 border-gray-900/30 shadow-lg overflow-hidden">
          <img src={logo} alt="SR Logo" className="w-full h-full object-cover" />
        </div>
        <div>
          <span className="text-gray-900 font-black text-sm tracking-wide leading-none">Smart Restaurant</span>
          <p className="text-gray-700 text-xs">Order & Pickup System</p>
        </div>
      </motion.div>
      <motion.div variants={fade} className="flex items-center gap-2">
        </motion.div>
    </div>

    {/* Hero Body */}
    <div className="grid lg:grid-cols-1 gap-0">
      {/* Left */}
      <div className="px-8 py-10 space-y-6">
        <motion.p variants={fade} className="text-gray-900 text-xs font-bold tracking-[0.2em] uppercase">Welcome to Smart Restaurant</motion.p>
        <motion.h1 variants={fade} className="text-gray-900 text-4xl font-black leading-tight">
          Order Food Easily,<br />
          <span className="text-gray-800">Get Digital Pickup</span>
        </motion.h1>
        <motion.p variants={fade} className="text-gray-800 text-sm leading-relaxed max-w-sm">
          Enjoy your favorite meals with a smart ordering and digital pickup experience.
        </motion.p>
        <motion.div variants={fade} className="flex gap-3 flex-wrap">
          <button onClick={onViewMenu} className="px-6 py-2.5 rounded-full text-sm font-bold transition-all hover:scale-105 active:scale-95"
            style={{ background: '#4c1d95', color: 'white' }}>
            🍽️ View Menu
          </button>
          <button onClick={onTrackOrder} className="px-6 py-2.5 rounded-full text-sm font-bold text-gray-900 border border-gray-900/50 hover:bg-black/10 transition-all">
            📦 Track Order
          </button>
        </motion.div>

        {/* Feature Cards */}
        <motion.div variants={fade} className="grid grid-cols-2 gap-3 pt-2">
          {FEATURES.map(f => (
            <div key={f.title}
              className="rounded-2xl p-4 border border-black/10 hover:border-black/20 transition-all hover:-translate-y-0.5"
              style={{ background: 'rgba(255,255,255,0.55)', backdropFilter: 'blur(10px)' }}
            >
              <span className="text-2xl">{f.icon}</span>
              <p className="text-gray-900 text-xs font-bold mt-2">{f.title}</p>
              <p className="text-gray-700 text-xs mt-0.5 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Right side empty */}
      <div className="hidden lg:block" />
    </div>
  </motion.div>
);

const CustomerDashboard = () => {
  const { user } = useAuth();
  const [currentOrder, setCurrentOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [foods, setFoods] = useState([]);
  const [categories, setCategories] = useState([]);
  const [catFilter, setCatFilter] = useState('');
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [placing, setPlacing] = useState(false);

  useEffect(() => {
    api.get('/orders/my-current').then(({ data }) => { setCurrentOrder(data.data); setLoading(false); }).catch(() => setLoading(false));
    api.get('/menu/foods?available=true').then(({ data }) => setFoods(data.data)).catch(() => {});
    api.get('/menu/categories').then(({ data }) => setCategories(data.data)).catch(() => {});
    const socket = getSocket();
    socket.on('order_status_update', ({ orderId, status }) => {
      setCurrentOrder(prev => prev && prev._id === orderId ? { ...prev, orderStatus: status } : prev);
    });
    return () => socket.off('order_status_update');
  }, []);

  const addToCart = (food) => {
    setCart(prev => {
      const existing = prev.find(i => i._id === food._id);
      if (existing) return prev.map(i => i._id === food._id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { ...food, quantity: 1 }];
    });
    toast.success(`${food.foodName} added to cart`);
  };

  const changeQty = (id, delta) => {
    setCart(prev => prev.map(i => i._id === id ? { ...i, quantity: Math.max(1, i.quantity + delta) } : i));
  };

  const removeFromCart = (id) => setCart(prev => prev.filter(i => i._id !== id));

  const placeOrder = async () => {
    if (!cart.length) return;
    setPlacing(true);
    try {
      const orderedItems = cart.map(i => ({
        food: i._id,
        foodName: i.foodName,
        price: i.price,
        quantity: i.quantity,
        subtotal: i.price * i.quantity,
      }));
      const { data } = await api.post('/orders', {
        customerName: user.name,
        customerPhone: user.phone || '0000000000',
        orderedItems,
        paymentMethod: 'cash',
        notes: 'Thank you for ordering!',
      });
      setCurrentOrder(data.data);
      setCart([]);
      setCartOpen(false);
      toast.success('Order placed successfully! 🎉');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order');
    } finally {
      setPlacing(false);
    }
  };

  const filtered = foods.filter(f =>
    (!catFilter || f.category?._id === catFilter) &&
    (!search || f.foodName.toLowerCase().includes(search.toLowerCase()))
  );

  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);

  if (loading) return <DashboardLayout links={customerLinks}><PageLoader /></DashboardLayout>;

  return (
    <DashboardLayout links={customerLinks}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Dashboard</h1>
          {cartCount > 0 && (
            <button onClick={() => setCartOpen(true)} className="btn-primary flex items-center gap-2 relative">
              <FiShoppingCart size={18} />
              <span>Cart</span>
              <span className="bg-white text-purple-600 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">{cartCount}</span>
            </button>
          )}
        </div>

        {/* ── HERO SECTION ── */}
        <HeroSection
          user={user}
          onViewMenu={() => document.getElementById('menu-section')?.scrollIntoView({ behavior: 'smooth' })}
          onTrackOrder={() => document.getElementById('order-tracker')?.scrollIntoView({ behavior: 'smooth' })}
        />

        <div id="order-tracker">
        {currentOrder ? <OrderTracker order={currentOrder} /> : (
          <div className="card text-center py-10">
            <FiPackage size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
            <h3 className="text-lg font-semibold text-gray-500 dark:text-gray-400">No Active Order</h3>
            <p className="text-sm text-gray-400 mt-1">Browse the menu below and place your order</p>
          </div>
        )}
        </div>

        <PickupCounter />

        {/* Menu Section */}
        <div id="menu-section" className="space-y-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <MdRestaurantMenu size={24} className="text-purple-600" /> Our Menu
          </h2>
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-48">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input className="input pl-10" placeholder="Search food..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <select className="input w-auto" value={catFilter} onChange={e => setCatFilter(e.target.value)}>
              <option value="">All Categories</option>
              {categories.map(c => <option key={c._id} value={c._id}>{c.categoryName}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {filtered.map(food => {
              const inCart = cart.find(i => i._id === food._id);
              return (
                <div key={food._id} className="card p-0 overflow-hidden flex flex-col">
                  <div className="h-36 bg-gray-100 dark:bg-gray-700">
                    {food.image
                      ? <img src={food.image} alt={food.foodName} className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center text-4xl">🍽️</div>}
                  </div>
                  <div className="p-3 flex flex-col flex-1">
                    <p className="font-semibold text-sm text-gray-900 dark:text-white truncate">{food.foodName}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{food.category?.categoryName}</p>
                    <p className="text-purple-600 font-bold mt-1">{formatCurrency(food.price)}</p>
                    <button
                      onClick={() => addToCart(food)}
                      className={`mt-2 w-full py-1.5 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-1 ${inCart ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' : 'bg-purple-600 text-white hover:bg-purple-700'}`}
                    >
                      <FiPlus size={14} />
                      {inCart ? `In Cart (${inCart.quantity})` : 'Add to Cart'}
                    </button>
                  </div>
                </div>
              );
            })}
            {filtered.length === 0 && (
              <div className="col-span-4 card text-center py-10 text-gray-400">No food items found</div>
            )}
          </div>
        </div>
      </div>

      {cartOpen && (
        <CartDrawer
          cart={cart}
          onClose={() => setCartOpen(false)}
          onQtyChange={changeQty}
          onRemove={removeFromCart}
          onPlaceOrder={placeOrder}
          placing={placing}
        />
      )}
    </DashboardLayout>
  );
};

export default CustomerDashboard;
