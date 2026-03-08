import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Recycle, Phone, Lock, Eye, EyeOff, LogIn } from 'lucide-react';

export default function Login() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await login(phone, password);
      if (data.user.role === 'resident') navigate('/resident');
      else if (data.user.role === 'driver') navigate('/driver');
      else if (data.user.role === 'admin') navigate('/admin');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel — photograph */}
      <div className="hidden lg:block lg:w-1/2 relative">
        <img
          src="https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=900&q=80"
          alt="Recycling facility"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-[#1b4332]/75" />
        <div className="relative z-10 h-full flex flex-col items-center justify-center p-12 text-center text-white">
          <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center mb-6">
            <Recycle className="w-9 h-9" />
          </div>
          <h2 className="text-3xl font-bold mb-3">Welcome Back</h2>
          <p className="text-stone-300 max-w-sm">Sign in to continue your journey towards a cleaner, sustainable community.</p>

          {/* Demo credentials */}
          <div className="mt-10 bg-white/10 rounded-xl p-5 text-left text-sm w-full max-w-xs">
            <p className="font-semibold text-stone-200 mb-3">Demo Accounts:</p>
            <div className="space-y-2 text-stone-300">
              <p><span className="text-white font-medium">Resident:</span> 7000000000 / user123</p>
              <p><span className="text-white font-medium">Driver:</span> 8000000001 / driver123</p>
              <p><span className="text-white font-medium">Admin:</span> 9999999999 / admin123</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel — form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-[#fafaf8]">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-9 h-9 rounded-lg bg-[#2d6a4f] flex items-center justify-center">
              <Recycle className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-[#1b4332]">EcoCircle</span>
          </div>

          <h1 className="text-3xl font-bold text-stone-900 mb-2">Sign In</h1>
          <p className="text-stone-500 mb-8">Enter your credentials to access your account</p>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-stone-300 rounded-lg bg-white transition-all"
                  placeholder="Enter phone number"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full pl-12 pr-12 py-3 border border-stone-300 rounded-lg bg-white transition-all"
                  placeholder="Enter password"
                  required
                />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600">
                  {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#2d6a4f] text-white font-semibold rounded-lg hover:bg-[#1b4332] transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  Sign In
                </>
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-stone-500">
            Don&apos;t have an account?
            <Link to="/register" className="ml-1 text-[#2d6a4f] font-semibold hover:text-[#1b4332]">Register here</Link>
          </p>

          {/* Mobile demo credentials */}
          <div className="lg:hidden mt-8 bg-white border border-stone-200 rounded-lg p-4 text-sm text-stone-600">
            <p className="font-semibold text-stone-700 mb-2">Demo Accounts:</p>
            <p>Resident: 7000000000 / user123</p>
            <p>Driver: 8000000001 / driver123</p>
            <p>Admin: 9999999999 / admin123</p>
          </div>
        </div>
      </div>
    </div>
  );
}
