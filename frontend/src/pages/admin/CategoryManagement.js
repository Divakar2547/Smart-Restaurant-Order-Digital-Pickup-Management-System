import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Modal from '../../components/ui/Modal';
import { PageLoader } from '../../components/ui/LoadingSpinner';
import { adminLinks } from '../../utils/navLinks';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';

const CategoryManagement = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ open: false, data: null });
  const [form, setForm] = useState({ categoryName: '', description: '' });
  const [saving, setSaving] = useState(false);

  const fetchCategories = async () => {
    try { const { data } = await api.get('/menu/categories'); setCategories(data.data); }
    catch { toast.error('Failed to load categories'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchCategories(); }, []);

  const openModal = (cat = null) => {
    setForm(cat ? { categoryName: cat.categoryName, description: cat.description || '' } : { categoryName: '', description: '' });
    setModal({ open: true, data: cat });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (modal.data) await api.put(`/menu/categories/${modal.data._id}`, form);
      else await api.post('/menu/categories', form);
      toast.success(`Category ${modal.data ? 'updated' : 'created'}`);
      setModal({ open: false, data: null });
      fetchCategories();
    } catch (error) { toast.error(error.response?.data?.message || 'Failed to save'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this category?')) return;
    try { await api.delete(`/menu/categories/${id}`); toast.success('Category deleted'); fetchCategories(); }
    catch { toast.error('Failed to delete'); }
  };

  if (loading) return <DashboardLayout links={adminLinks}><PageLoader /></DashboardLayout>;

  return (
    <DashboardLayout links={adminLinks}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Food Categories</h1>
          <button onClick={() => openModal()} className="btn-primary flex items-center gap-2"><FiPlus size={18} /> Add Category</button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map(cat => (
            <div key={cat._id} className="card flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">{cat.categoryName}</h3>
                {cat.description && <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{cat.description}</p>}
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => openModal(cat)} className="p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-500"><FiEdit2 size={16} /></button>
                <button onClick={() => handleDelete(cat._id)} className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500"><FiTrash2 size={16} /></button>
              </div>
            </div>
          ))}
          {categories.length === 0 && (
            <div className="col-span-3 card text-center py-12 text-gray-400">
              <p>No categories yet. Add your first category!</p>
            </div>
          )}
        </div>
      </div>
      <Modal isOpen={modal.open} onClose={() => setModal({ open: false, data: null })} title={modal.data ? 'Edit Category' : 'Add Category'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Category Name</label>
            <input className="input" value={form.categoryName} onChange={e => setForm({ ...form, categoryName: e.target.value })} required />
          </div>
          <div>
            <label className="label">Description (optional)</label>
            <textarea className="input" rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={() => setModal({ open: false, data: null })} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary flex-1">{saving ? 'Saving...' : 'Save'}</button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
};

export default CategoryManagement;
