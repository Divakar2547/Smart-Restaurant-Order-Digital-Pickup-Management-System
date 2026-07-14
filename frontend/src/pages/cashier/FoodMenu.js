import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Modal from '../../components/ui/Modal';
import { PageLoader } from '../../components/ui/LoadingSpinner';
import { cashierLinks } from '../../utils/navLinks';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { formatCurrency } from '../../utils/helpers';
import { FiSearch, FiEdit2, FiTrash2, FiToggleLeft, FiToggleRight } from 'react-icons/fi';

const FoodMenu = () => {
  const [foods, setFoods] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('');
  const [editModal, setEditModal] = useState({ open: false, data: null });
  const [form, setForm] = useState({ foodName: '', category: '', description: '', price: '', available: true });
  const [imageFile, setImageFile] = useState(null);
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    try {
      const [foodsRes, catsRes] = await Promise.all([api.get('/menu/foods'), api.get('/menu/categories')]);
      setFoods(foodsRes.data.data);
      setCategories(catsRes.data.data);
    } catch { toast.error('Failed to load menu'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const openEdit = (food) => {
    setForm({ foodName: food.foodName, category: food.category?._id || '', description: food.description || '', price: food.price, available: food.available });
    setImageFile(null);
    setEditModal({ open: true, data: food });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (imageFile) fd.append('image', imageFile);
      await api.put(`/menu/foods/${editModal.data._id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Food updated');
      setEditModal({ open: false, data: null });
      fetchData();
    } catch { toast.error('Failed to update'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this food item?')) return;
    try { await api.delete(`/menu/foods/${id}`); toast.success('Food deleted'); fetchData(); }
    catch { toast.error('Failed to delete'); }
  };

  const filtered = foods.filter(f =>
    (!search || f.foodName.toLowerCase().includes(search.toLowerCase())) &&
    (!catFilter || f.category?._id === catFilter)
  );

  if (loading) return <DashboardLayout links={cashierLinks}><PageLoader /></DashboardLayout>;

  return (
    <DashboardLayout links={cashierLinks}>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Food Menu</h1>
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map(food => (
            <div key={food._id} className="card p-0 overflow-hidden">
              <div className="h-40 bg-gray-100 dark:bg-gray-700 relative">
                {food.image ? <img src={food.image} alt={food.foodName} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-4xl">🍽️</div>}
                <span className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-xs font-medium ${food.available ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                  {food.available ? 'Available' : 'Unavailable'}
                </span>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 dark:text-white">{food.foodName}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{food.category?.categoryName}</p>
                <p className="text-purple-600 font-bold mt-2">{formatCurrency(food.price)}</p>
                <div className="flex gap-2 mt-3">
                  <button onClick={() => openEdit(food)} className="flex-1 btn-secondary py-1.5 text-sm flex items-center justify-center gap-1"><FiEdit2 size={14} /> Edit</button>
                  <button onClick={() => handleDelete(food._id)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 border border-gray-200 dark:border-gray-700"><FiTrash2 size={16} /></button>
                </div>
              </div>
            </div>
          ))}
          {filtered.length === 0 && <div className="col-span-4 card text-center py-12 text-gray-400">No food items found</div>}
        </div>
      </div>

      <Modal isOpen={editModal.open} onClose={() => setEditModal({ open: false, data: null })} title="Edit Food Item">
        <form onSubmit={handleUpdate} className="space-y-4">
          <div>
            <label className="label">Food Name</label>
            <input className="input" value={form.foodName} onChange={e => setForm({ ...form, foodName: e.target.value })} required />
          </div>
          <div>
            <label className="label">Category</label>
            <select className="input" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} required>
              <option value="">Select category</option>
              {categories.map(c => <option key={c._id} value={c._id}>{c.categoryName}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Price (₹)</label>
            <input type="number" className="input" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} required min={0} step={0.01} />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea className="input" rows={2} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
          </div>
          <div>
            <label className="label">Food Image</label>
            <input type="file" accept="image/*" className="input" onChange={e => setImageFile(e.target.files[0])} />
          </div>
          <div className="flex items-center gap-3">
            <label className="label mb-0">Available</label>
            <button type="button" onClick={() => setForm({ ...form, available: !form.available })}>
              {form.available ? <FiToggleRight size={28} className="text-green-500" /> : <FiToggleLeft size={28} className="text-gray-400" />}
            </button>
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={() => setEditModal({ open: false, data: null })} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary flex-1">{saving ? 'Saving...' : 'Update'}</button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
};

export default FoodMenu;
