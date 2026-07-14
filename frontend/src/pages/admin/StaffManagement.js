import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Modal from '../../components/ui/Modal';
import { PageLoader } from '../../components/ui/LoadingSpinner';
import { adminLinks } from '../../utils/navLinks';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { FiPlus, FiEdit2, FiTrash2, FiSearch } from 'react-icons/fi';

const ROLES = ['cashier', 'kitchen', 'pickup'];

const StaffManagement = () => {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState({ open: false, data: null });
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', role: 'cashier' });
  const [saving, setSaving] = useState(false);

  const fetchStaff = async () => {
    try { const { data } = await api.get('/admin/staff'); setStaff(data.data); }
    catch { toast.error('Failed to load staff'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchStaff(); }, []);

  const openModal = (member = null) => {
    setForm(member ? { name: member.name, email: member.email, phone: member.phone, password: '', role: member.role } : { name: '', email: '', phone: '', password: '', role: 'cashier' });
    setModal({ open: true, data: member });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form };
      if (modal.data && !payload.password) delete payload.password;
      if (modal.data) await api.put(`/admin/staff/${modal.data._id}`, payload);
      else await api.post('/admin/staff', payload);
      toast.success(`Staff ${modal.data ? 'updated' : 'created'} successfully`);
      setModal({ open: false, data: null });
      fetchStaff();
    } catch (error) { toast.error(error.response?.data?.message || 'Failed to save'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Deactivate this staff member?')) return;
    try { await api.delete(`/admin/staff/${id}`); toast.success('Staff deactivated'); fetchStaff(); }
    catch { toast.error('Failed to deactivate'); }
  };

  const filtered = staff.filter(s => s.name.toLowerCase().includes(search.toLowerCase()) || s.email.toLowerCase().includes(search.toLowerCase()));

  const roleBadge = (role) => {
    const colors = { cashier: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200', kitchen: 'bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-600', pickup: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' };
    return <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[role]}`}>{role}</span>;
  };

  if (loading) return <DashboardLayout links={adminLinks}><PageLoader /></DashboardLayout>;

  return (
    <DashboardLayout links={adminLinks}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Staff Management</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{staff.length} staff members</p>
          </div>
          <button onClick={() => openModal()} className="btn-primary flex items-center gap-2">
            <FiPlus size={18} /> Add Staff
          </button>
        </div>
        <div className="card">
          <div className="relative mb-4">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input className="input pl-10" placeholder="Search staff..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  {['Name', 'Email', 'Phone', 'Role', 'Status', 'Actions'].map(h => (
                    <th key={h} className="text-left py-3 px-4 font-semibold text-gray-600 dark:text-gray-400">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {filtered.map(member => (
                  <tr key={member._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="py-3 px-4 font-medium">{member.name}</td>
                    <td className="py-3 px-4 text-gray-500">{member.email}</td>
                    <td className="py-3 px-4 text-gray-500">{member.phone}</td>
                    <td className="py-3 px-4">{roleBadge(member.role)}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${member.isActive ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800'}`}>
                        {member.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <button onClick={() => openModal(member)} className="p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-500 transition-colors"><FiEdit2 size={16} /></button>
                        <button onClick={() => handleDelete(member._id)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 transition-colors"><FiTrash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && <tr><td colSpan={6} className="py-8 text-center text-gray-400">No staff found</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Modal isOpen={modal.open} onClose={() => setModal({ open: false, data: null })} title={modal.data ? 'Edit Staff' : 'Add Staff'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          {[['name', 'Full Name', 'text'], ['email', 'Email', 'email'], ['phone', 'Phone', 'tel']].map(([field, label, type]) => (
            <div key={field}>
              <label className="label">{label}</label>
              <input type={type} className="input" value={form[field]} onChange={e => setForm({ ...form, [field]: e.target.value })} required />
            </div>
          ))}
          <div>
            <label className="label">Password {modal.data && '(leave blank to keep current)'}</label>
            <input type="password" className="input" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required={!modal.data} minLength={6} />
          </div>
          <div>
            <label className="label">Role</label>
            <select className="input" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
              {ROLES.map(r => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setModal({ open: false, data: null })} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary flex-1">{saving ? 'Saving...' : 'Save'}</button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
};

export default StaffManagement;
