import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import img1 from '../../assets/img1.jpeg';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import toast from 'react-hot-toast';
import { FiMail, FiLock, FiEye, FiEyeOff, FiSun, FiMoon } from 'react-icons/fi';

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const { login, loading } = useAuth();
  const { dark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await login(form.email, form.password);
    if (result.success) { toast.success('Welcome back!'); navigate(result.redirect); }
    else toast.error(result.message);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-violet-100 dark:from-gray-900 dark:to-gray-800 flex">
      <button onClick={toggleTheme} className="fixed top-4 right-4 p-2 rounded-lg bg-white dark:bg-gray-800 shadow-md z-10">
        {dark ? <FiSun size={18} /> : <FiMoon size={18} />}
      </button>

      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-purple-700 to-violet-800 flex-col items-center justify-center p-10 text-white relative overflow-hidden">
        {/* Background decorative circles */}
        <div className="absolute top-[-80px] left-[-80px] w-72 h-72 bg-white/5 rounded-full" />
        <div className="absolute bottom-[-60px] right-[-60px] w-56 h-56 bg-white/5 rounded-full" />

        <div className="relative z-10 flex flex-col items-center w-full max-w-lg">
          <div className="w-20 h-20 rounded-3xl overflow-hidden mb-6 shadow-xl border-4 border-white/30">
            <img src={img1} alt="SR Logo" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-4xl font-extrabold text-center leading-snug mb-3 drop-shadow">
            Smart Restaurant<br />
            <span className="text-purple-200">Order &amp; Digital Pickup</span><br />
            Management System
          </h1>
          <p className="text-purple-100 text-center text-base mb-6 max-w-md leading-relaxed">
            Streamline your restaurant operations with real-time order tracking and digital pickup codes.
          </p>
          <div className="w-full rounded-3xl overflow-hidden shadow-2xl border-4 border-white/20 bg-white">
            <img src={img1} alt="Restaurant" className="w-full h-64 object-cover" />
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="text-center mb-8 lg:hidden">
            <div className="w-16 h-16 rounded-2xl overflow-hidden mx-auto mb-4 shadow-lg border-2 border-purple-200">
              <img src={img1} alt="SR Logo" className="w-full h-full object-cover" />
            </div>
            <h1 className="text-2xl font-black text-gray-900 dark:text-white">Smart Restaurant</h1>
            <p className="text-purple-700 font-semibold text-sm">Order &amp; Digital Pickup Management System</p>
          </div>
          <div className="hidden lg:block mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Welcome back!</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Sign in to your account</p>
          </div>
          <div className="card shadow-xl">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="label">Email Address</label>
                <div className="relative">
                  <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input type="email" className="input pl-10" placeholder="you@example.com"
                    value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
                </div>
              </div>
              <div>
                <label className="label">Password</label>
                <div className="relative">
                  <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input type={showPass ? 'text' : 'password'} className="input pl-10 pr-10" placeholder="••••••••"
                    value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
                  <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPass ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                  </button>
                </div>
              </div>
              <div className="flex justify-end">
                <Link to="/forgot-password" className="text-sm text-purple-600 hover:text-purple-700">Forgot password?</Link>
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base">
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>
            <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
              Don't have an account? <Link to="/register" className="text-purple-600 hover:text-purple-700 font-medium">Register</Link>
            </p>
          </div>
          <p className="text-center text-xs text-gray-400 mt-6">Demo: admin@restaurant.com / admin123</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
