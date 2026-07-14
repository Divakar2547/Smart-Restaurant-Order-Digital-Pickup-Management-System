import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { PageLoader } from '../../components/ui/LoadingSpinner';
import { adminLinks } from '../../utils/navLinks';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const Settings = () => {
  const [form, setForm] = useState({ restaurantName: '', address: '', phone: '', email: '', gstNumber: '', gstRate: 5, currency: 'INR', currencySymbol: '₹', openTime: '09:00', closeTime: '22:00' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get('/admin/settings').then(({ data }) => { setForm(data.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try { await api.put('/admin/settings', form); toast.success('Settings saved!'); }
    catch { toast.error('Failed to save settings'); }
    finally { setSaving(false); }
  };

  if (loading) return <DashboardLayout links={adminLinks}><PageLoader /></DashboardLayout>;

  return (
    <DashboardLayout links={adminLinks}>
      <div className="max-w-2xl space-y-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Restaurant Settings</h1>
        <form onSubmit={handleSubmit} className="card space-y-5">
          <h2 className="text-lg font-semibold border-b border-gray-200 dark:border-gray-700 pb-3">General Information</h2>
          {[['restaurantName', 'Restaurant Name'], ['address', 'Address'], ['phone', 'Phone Number'], ['email', 'Email Address'], ['gstNumber', 'GST Number']].map(([field, label]) => (
            <div key={field}>
              <label className="label">{label}</label>
              <input className="input" value={form[field] || ''} onChange={e => setForm({ ...form, [field]: e.target.value })} />
            </div>
          ))}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">GST Rate (%)</label>
              <input type="number" className="input" value={form.gstRate} onChange={e => setForm({ ...form, gstRate: Number(e.target.value) })} min={0} max={100} />
            </div>
            <div>
              <label className="label">Currency Symbol</label>
              <input className="input" value={form.currencySymbol} onChange={e => setForm({ ...form, currencySymbol: e.target.value })} />
            </div>
            <div>
              <label className="label">Opening Time</label>
              <input type="time" className="input" value={form.openTime} onChange={e => setForm({ ...form, openTime: e.target.value })} />
            </div>
            <div>
              <label className="label">Closing Time</label>
              <input type="time" className="input" value={form.closeTime} onChange={e => setForm({ ...form, closeTime: e.target.value })} />
            </div>
          </div>
          <button type="submit" disabled={saving} className="btn-primary w-full py-3">{saving ? 'Saving...' : 'Save Settings'}</button>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
