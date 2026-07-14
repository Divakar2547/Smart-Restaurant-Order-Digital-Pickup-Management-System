import { useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { customerLinks } from '../../utils/navLinks';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { FiUser, FiMail, FiPhone, FiEdit2, FiSave } from 'react-icons/fi';

const CustomerProfile = () => {
  const { user, updateUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: user?.name || '', email: user?.email || '', phone: user?.phone || '' });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data } = await api.put('/customer/profile', form);
      updateUser(data.data);
      toast.success('Profile updated!');
      setEditing(false);
    } catch (error) { toast.error(error.response?.data?.message || 'Failed to update'); }
    finally { setSaving(false); }
  };

  return (
    <DashboardLayout links={customerLinks}>
      <div className="max-w-lg space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Profile</h1>
          <button onClick={() => editing ? handleSave() : setEditing(true)} disabled={saving}
            className={`flex items-center gap-2 ${editing ? 'btn-primary' : 'btn-secondary'}`}>
            {editing ? <><FiSave size={16} /> {saving ? 'Saving...' : 'Save'}</> : <><FiEdit2 size={16} /> Edit</>}
          </button>
        </div>
        <div className="card space-y-5">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 bg-purple-600 rounded-full flex items-center justify-center text-white text-3xl font-bold">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">{user?.name}</h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-600 capitalize">{user?.role}</span>
            </div>
          </div>
          {[
            { icon: FiUser, label: 'Full Name', field: 'name', type: 'text' },
            { icon: FiMail, label: 'Email Address', field: 'email', type: 'email' },
            { icon: FiPhone, label: 'Phone Number', field: 'phone', type: 'tel' },
          ].map(({ icon: Icon, label, field, type }) => (
            <div key={field}>
              <label className="label flex items-center gap-2"><Icon size={14} /> {label}</label>
              {editing ? (
                <input type={type} className="input" value={form[field]} onChange={e => setForm({ ...form, [field]: e.target.value })} />
              ) : (
                <p className="px-4 py-2.5 bg-gray-50 dark:bg-gray-700 rounded-lg text-gray-900 dark:text-gray-100">{user?.[field] || '-'}</p>
              )}
            </div>
          ))}
          {editing && (
            <button onClick={() => setEditing(false)} className="btn-secondary w-full">Cancel</button>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CustomerProfile;
