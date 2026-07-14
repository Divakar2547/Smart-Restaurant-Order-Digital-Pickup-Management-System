import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { cashierLinks } from '../../utils/navLinks';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const AddFood = () => {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ foodName: '', category: '', description: '', price: '', available: true, imageUrl: '' });
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/menu/categories').then(({ data }) => setCategories(data.data)).catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/menu/foods', { ...form, image: form.imageUrl });
      toast.success('Food item added!');
      navigate('/cashier/menu');
    } catch (error) { toast.error(error.response?.data?.message || 'Failed to add food'); }
    finally { setSaving(false); }
  };

  return (
    <DashboardLayout links={cashierLinks}>
      <div className="max-w-lg space-y-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Add Food Item</h1>
        <form onSubmit={handleSubmit} className="card space-y-5">
          <div>
            <label className="label">Food Name</label>
            <input className="input" placeholder="e.g. Butter Chicken" value={form.foodName} onChange={e => setForm({ ...form, foodName: e.target.value })} required />
          </div>
          <div>
            <label className="label">Category</label>
            <select className="input" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} required>
              <option value="">Select a category</option>
              {categories.map(c => <option key={c._id} value={c._id}>{c.categoryName}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Price (₹)</label>
            <input type="number" className="input" placeholder="0.00" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} required min={0} step={0.01} />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea className="input" rows={3} placeholder="Brief description..." value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
          </div>
          <div>
            <label className="label">Food Image URL</label>
            <input className="input" placeholder="https://example.com/image.jpg" value={form.imageUrl} onChange={e => setForm({ ...form, imageUrl: e.target.value })} />
            {form.imageUrl && (
              <img src={form.imageUrl} alt="preview" className="mt-2 h-32 w-full object-cover rounded-lg border border-gray-200 dark:border-gray-700" onError={e => e.target.style.display='none'} />
            )}
          </div>
          <div className="flex items-center gap-3">
            <input type="checkbox" id="available" checked={form.available} onChange={e => setForm({ ...form, available: e.target.checked })} className="w-4 h-4 accent-purple-600" />
            <label htmlFor="available" className="text-sm font-medium text-gray-700 dark:text-gray-300">Available for ordering</label>
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={() => navigate('/cashier/menu')} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary flex-1">{saving ? 'Adding...' : 'Add Food Item'}</button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default AddFood;
