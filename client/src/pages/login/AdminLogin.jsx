import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Shield, Phone, Lock, Eye, EyeOff, LogIn, ArrowLeft, BarChart3, Users, MapPin } from 'lucide-react';

export default function AdminLogin() {
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
      {/* Left Panel */}
      <div className="hidden lg:block lg:w-1/2 relative">
        <img
          src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=900&q=80"
          alt="Data analytics dashboard"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-[#1b4332]/85" />
        <div className="relative z-10 h-full flex flex-col items-center justify-center p-12 text-center text-white">
          <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center mb-6">
            <Shield className="w-9 h-9" />
          </div>
          <h2 className="text-3xl font-bold mb-3">Admin Portal</h2>
          <p className="text-stone-200 max-w-sm leading-relaxed">
            Municipality dashboard for monitoring garbage reports, managing routes, tracking drivers, and analysing waste statistics.
          </p>

          <div className="mt-10 space-y-3 text-left text-sm w-full max-w-xs">
            <div className="flex items-start gap-3 text-stone-200">
              <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <BarChart3 className="w-3 h-3" />
              </div>
              <span>Monitor collection reports &amp; statistics</span>
            </div>
            <div className="flex items-start gap-3 text-stone-200">
              <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <MapPin className="w-3 h-3" />
              </div>
              <span>Visualize &amp; optimize collection routes</span>
            </div>
            <div className="flex items-start gap-3 text-stone-200">
              <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Users className="w-3 h-3" />
              </div>
              <span>Manage drivers, households &amp; assignments</span>
            </div>
          </div>

          <div className="mt-10 bg-white/10 rounded-xl p-5 text-left text-sm w-full max-w-xs">
            <p className="font-semibold text-stone-200 mb-2">Demo Account:</p>
            <p className="text-stone-300"><span className="text-white font-medium">Phone:</span> 9999999999</p>
            <p className="text-stone-300"><span className="text-white font-medium">Password:</span> admin123</p>
          </div>
        </div>
      </div>

      {/* Right Panel — form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-[#fafaf8]">
        <div className="w-full max-w-md">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-stone-500 hover:text-[#1b4332] mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>

          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-[#1b4332]/10 flex items-center justify-center">
              <Shield className="w-5 h-5 text-[#1b4332]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-stone-900">Admin Sign In</h1>
            </div>
          </div>
          <p className="text-stone-500 mb-8 ml-[52px]">Municipality waste management control panel</p>

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
                  className="w-full pl-12 pr-4 py-3 border border-stone-300 rounded-lg bg-white focus:ring-2 focus:ring-[#1b4332]/20 focus:border-[#1b4332] transition-all outline-none"
                  placeholder="Enter admin phone number"
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
                  className="w-full pl-12 pr-12 py-3 border border-stone-300 rounded-lg bg-white focus:ring-2 focus:ring-[#1b4332]/20 focus:border-[#1b4332] transition-all outline-none"
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
              className="w-full py-3 bg-[#1b4332] text-white font-semibold rounded-lg hover:bg-[#14332a] transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  Sign In as Admin
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-stone-200">
            <p className="text-xs text-stone-400 text-center mb-3">Other portals</p>
            <div className="flex gap-3">
              <Link to="/login/resident" className="flex-1 text-center py-2.5 text-sm font-medium text-stone-600 bg-white border border-stone-200 rounded-lg hover:border-[#2d6a4f] hover:text-[#2d6a4f] transition-colors">
                Resident Login
              </Link>
              <Link to="/login/driver" className="flex-1 text-center py-2.5 text-sm font-medium text-stone-600 bg-white border border-stone-200 rounded-lg hover:border-[#52796f] hover:text-[#52796f] transition-colors">
                Driver Login
              </Link>
            </div>
          </div>

          {/* Mobile demo credentials */}
          <div className="lg:hidden mt-6 bg-white border border-stone-200 rounded-lg p-4 text-sm text-stone-600">
            <p className="font-semibold text-stone-700 mb-2">Demo Account:</p>
            <p>Phone: 9999999999 / Password: admin123</p>
          </div>
        </div>
      </div>
    </div>
  );
}
