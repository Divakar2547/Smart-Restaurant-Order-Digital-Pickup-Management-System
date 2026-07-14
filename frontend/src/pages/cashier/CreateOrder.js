import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Modal from '../../components/ui/Modal';
import { cashierLinks } from '../../utils/navLinks';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { formatCurrency } from '../../utils/helpers';
import { FiPlus, FiMinus, FiTrash2, FiSearch } from 'react-icons/fi';

const CreateOrder = () => {
  const [foods, setFoods] = useState([]);
  const [categories, setCategories] = useState([]);
  const [cart, setCart] = useState([]);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('');
  const [customer, setCustomer] = useState({ name: '', phone: '' });
  const [discount, setDiscount] = useState(0);
  const [gst, setGst] = useState(5);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [notes, setNotes] = useState('Thank you for ordering!');
  const [placing, setPlacing] = useState(false);
  const [successModal, setSuccessModal] = useState({ open: false, order: null });

  useEffect(() => {
    Promise.all([api.get('/menu/foods?available=true'), api.get('/menu/categories')]).then(([f, c]) => {
      setFoods(f.data.data);
      setCategories(c.data.data);
    });
  }, []);

  const addToCart = (food) => {
    setCart(prev => {
      const existing = prev.find(i => i.food === food._id);
      if (existing) return prev.map(i => i.food === food._id ? { ...i, quantity: i.quantity + 1, subtotal: (i.quantity + 1) * i.price } : i);
      return [...prev, { food: food._id, foodName: food.foodName, price: food.price, quantity: 1, subtotal: food.price }];
    });
  };

  const updateQty = (foodId, delta) => {
    setCart(prev => prev.map(i => i.food === foodId ? { ...i, quantity: Math.max(1, i.quantity + delta), subtotal: Math.max(1, i.quantity + delta) * i.price } : i).filter(i => i.quantity > 0));
  };

  const removeFromCart = (foodId) => setCart(prev => prev.filter(i => i.food !== foodId));

  const subtotal = cart.reduce((s, i) => s + i.subtotal, 0);
  const discountAmt = (subtotal * discount) / 100;
  const gstAmt = ((subtotal - discountAmt) * gst) / 100;
  const total = subtotal - discountAmt + gstAmt;

  const handlePlaceOrder = async () => {
    if (!customer.name || !customer.phone) return toast.error('Enter customer name and phone');
    if (cart.length === 0) return toast.error('Add at least one item');
    setPlacing(true);
    try {
      const { data } = await api.post('/orders', { customerName: customer.name, customerPhone: customer.phone, orderedItems: cart, discount, gst, paymentMethod, notes });
      setSuccessModal({ open: true, order: data.data });
      setCart([]);
      setCustomer({ name: '', phone: '' });
      setDiscount(0);
      setNotes('');
      toast.success('Order placed successfully!');
    } catch (error) { toast.error(error.response?.data?.message || 'Failed to place order'); }
    finally { setPlacing(false); }
  };

  const filtered = foods.filter(f => (!search || f.foodName.toLowerCase().includes(search.toLowerCase())) && (!catFilter || f.category?._id === catFilter));

  return (
    <DashboardLayout links={cashierLinks}>
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Menu */}
        <div className="xl:col-span-2 space-y-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Create Order</h1>
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-48">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input className="input pl-10" placeholder="Search food..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <select className="input w-auto" value={catFilter} onChange={e => setCatFilter(e.target.value)}>
              <option value="">All</option>
              {categories.map(c => <option key={c._id} value={c._id}>{c.categoryName}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {filtered.map(food => {
              const inCart = cart.find(i => i.food === food._id);
              return (
                <button key={food._id} onClick={() => addToCart(food)}
                  className={`card p-3 text-left hover:shadow-md transition-all cursor-pointer ${inCart ? 'ring-2 ring-purple-600' : ''}`}>
                  <div className="h-24 bg-gray-100 dark:bg-gray-700 rounded-lg mb-2 overflow-hidden">
                    {food.image ? <img src={food.image} alt={food.foodName} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-3xl">🍽️</div>}
                  </div>
                  <p className="font-medium text-sm text-gray-900 dark:text-white truncate">{food.foodName}</p>
                  <p className="text-purple-600 font-bold text-sm mt-0.5">{formatCurrency(food.price)}</p>
                  {inCart && <span className="text-xs text-purple-600 font-medium">×{inCart.quantity} in cart</span>}
                </button>
              );
            })}
          </div>
        </div>

        {/* Order Summary */}
        <div className="space-y-4">
          <div className="card space-y-4">
            <h2 className="text-lg font-semibold">Customer Details</h2>
            <div>
              <label className="label">Customer Name</label>
              <input className="input" placeholder="John Doe" value={customer.name} onChange={e => setCustomer({ ...customer, name: e.target.value })} />
            </div>
            <div>
              <label className="label">Phone Number</label>
              <input className="input" placeholder="+91 9876543210" value={customer.phone} onChange={e => setCustomer({ ...customer, phone: e.target.value })} />
            </div>
          </div>

          <div className="card space-y-3">
            <h2 className="text-lg font-semibold">Order Items ({cart.length})</h2>
            {cart.length === 0 ? <p className="text-gray-400 text-sm text-center py-4">No items added yet</p> : (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {cart.map(item => (
                  <div key={item.food} className="flex items-center gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.foodName}</p>
                      <p className="text-xs text-gray-500">{formatCurrency(item.price)} each</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => updateQty(item.food, -1)} className="w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-600"><FiMinus size={12} /></button>
                      <span className="w-6 text-center text-sm font-medium">{item.quantity}</span>
                      <button onClick={() => updateQty(item.food, 1)} className="w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 flex items-center justify-center hover:bg-purple-600"><FiPlus size={12} /></button>
                    </div>
                    <span className="text-sm font-medium w-16 text-right">{formatCurrency(item.subtotal)}</span>
                    <button onClick={() => removeFromCart(item.food)} className="text-red-400 hover:text-red-600"><FiTrash2 size={14} /></button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="card space-y-3">
            <h2 className="text-lg font-semibold">Bill Summary</h2>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Discount (%)</label>
                <input type="number" className="input" value={discount} onChange={e => setDiscount(Number(e.target.value))} min={0} max={100} />
              </div>
              <div>
                <label className="label">GST (%)</label>
                <input type="number" className="input" value={gst} onChange={e => setGst(Number(e.target.value))} min={0} max={100} />
              </div>
            </div>
            <div>
              <label className="label">Payment Method</label>
              <select className="input" value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)}>
                <option value="cash">Cash</option>
                <option value="card">Card</option>
                <option value="upi">UPI</option>
              </select>
            </div>
            <div>
              <label className="label">Notes</label>
              <input className="input" placeholder="Special instructions..." value={notes} onChange={e => setNotes(e.target.value)} />
            </div>
            <div className="border-t border-gray-200 dark:border-gray-700 pt-3 space-y-1.5 text-sm">
              <div className="flex justify-between text-gray-600 dark:text-gray-400"><span>Subtotal</span><span>{formatCurrency(subtotal)}</span></div>
              {discount > 0 && <div className="flex justify-between text-green-600"><span>Discount ({discount}%)</span><span>-{formatCurrency(discountAmt)}</span></div>}
              <div className="flex justify-between text-gray-600 dark:text-gray-400"><span>GST ({gst}%)</span><span>+{formatCurrency(gstAmt)}</span></div>
              <div className="flex justify-between font-bold text-lg text-gray-900 dark:text-white border-t border-gray-200 dark:border-gray-700 pt-2"><span>Total</span><span className="text-purple-600">{formatCurrency(total)}</span></div>
            </div>
            <button onClick={handlePlaceOrder} disabled={placing || cart.length === 0} className="btn-primary w-full py-3 text-base">
              {placing ? 'Placing Order...' : 'Place Order & Generate Code'}
            </button>
          </div>
        </div>
      </div>

      <Modal isOpen={successModal.open} onClose={() => setSuccessModal({ open: false, order: null })} title="Order Placed Successfully!" size="sm">
        {successModal.order && (
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto">
              <span className="text-3xl">✅</span>
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Pickup Code</p>
              <p className="text-5xl font-bold text-purple-600 font-mono tracking-widest mt-1">{successModal.order.pickupCode}</p>
            </div>
            {successModal.order.qrCode && <img src={successModal.order.qrCode} alt="QR Code" className="w-32 h-32 mx-auto rounded-lg" />}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 text-sm">
              <p className="font-medium">{successModal.order.customerName}</p>
              <p className="text-gray-500">{successModal.order.customerPhone}</p>
              <p className="text-purple-600 font-bold mt-1">{formatCurrency(successModal.order.totalAmount)}</p>
            </div>
            <p className="text-xs text-gray-400">SMS sent to customer with pickup code</p>
            <button onClick={() => setSuccessModal({ open: false, order: null })} className="btn-primary w-full">Done</button>
          </div>
        )}
      </Modal>
    </DashboardLayout>
  );
};

export default CreateOrder;
