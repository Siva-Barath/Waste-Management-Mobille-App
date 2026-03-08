import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Recycle, User, Phone, Lock, MapPin, Home, Users, Globe, ArrowRight } from 'lucide-react';

export default function Register() {
  const [form, setForm] = useState({
    name: '', phone: '', password: '', address: '', numResidents: 1, ward: 'Ward 1', language: 'en'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const { register } = useAuth();
  const navigate = useNavigate();

  const update = (field, value) => setForm(f => ({ ...f, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      let latitude = 13.0827, longitude = 80.2707;
      if (navigator.geolocation) {
        try {
          const pos = await new Promise((resolve, reject) =>
            navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 })
          );
          latitude = pos.coords.latitude;
          longitude = pos.coords.longitude;
        } catch { /* Use default coordinates */ }
      }
      await register({ ...form, latitude, longitude, role: 'resident' });
      navigate('/resident');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel — photograph */}
      <div className="hidden lg:block lg:w-1/2 relative">
        <img
          src="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=900&q=80"
          alt="Green environment"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-[#1b4332]/75" />
        <div className="relative z-10 h-full flex flex-col items-center justify-center p-12 text-center text-white">
          <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center mb-6">
            <Recycle className="w-9 h-9" />
          </div>
          <h2 className="text-3xl font-bold mb-3">Join EcoCircle</h2>
          <p className="text-stone-300 max-w-sm mb-8">Register your household and be part of the smart waste revolution. Every report counts.</p>
          <div className="w-full max-w-xs space-y-3 text-left bg-white/10 rounded-xl p-5">
            {['Report garbage availability daily', 'AI optimizes collection routes', 'Earn rewards for proper segregation'].map((t, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-7 h-7 bg-white/20 rounded-md flex items-center justify-center text-xs font-bold">{i + 1}</div>
                <p className="text-stone-200 text-sm">{t}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel — form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-[#fafaf8]">
        <div className="w-full max-w-lg">
          <div className="lg:hidden flex items-center gap-3 mb-6">
            <div className="w-9 h-9 rounded-lg bg-[#2d6a4f] flex items-center justify-center">
              <Recycle className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-[#1b4332]">EcoCircle</span>
          </div>

          <h1 className="text-3xl font-bold text-stone-900 mb-2">Create Account</h1>
          <p className="text-stone-500 mb-6">Register your household in the smart waste system</p>

          {/* Step indicators */}
          <div className="flex items-center gap-3 mb-8">
            {[1, 2].map(s => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${step >= s ? 'bg-[#2d6a4f] text-white' : 'bg-stone-200 text-stone-500'}`}>
                  {s}
                </div>
                <span className="text-sm text-stone-600 hidden sm:block">{s === 1 ? 'Personal Info' : 'Address Details'}</span>
                {s < 2 && <div className="w-12 h-0.5 bg-stone-200"><div className={`h-full bg-[#2d6a4f] transition-all ${step > 1 ? 'w-full' : 'w-0'}`} /></div>}
              </div>
            ))}
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {step === 1 && (
              <>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                    <input type="text" value={form.name} onChange={e => update('name', e.target.value)} className="w-full pl-12 pr-4 py-3 border border-stone-300 rounded-lg bg-white transition-all" placeholder="Enter your name" required />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                    <input type="tel" value={form.phone} onChange={e => update('phone', e.target.value)} className="w-full pl-12 pr-4 py-3 border border-stone-300 rounded-lg bg-white transition-all" placeholder="Enter phone number" required />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                    <input type="password" value={form.password} onChange={e => update('password', e.target.value)} className="w-full pl-12 pr-4 py-3 border border-stone-300 rounded-lg bg-white transition-all" placeholder="Create password" required />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">Language</label>
                  <div className="relative">
                    <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                    <select value={form.language} onChange={e => update('language', e.target.value)} className="w-full pl-12 pr-4 py-3 border border-stone-300 rounded-lg bg-white transition-all appearance-none">
                      <option value="en">English</option>
                      <option value="ta">Tamil</option>
                      <option value="hi">Hindi</option>
                    </select>
                  </div>
                </div>
                <button type="button" onClick={() => setStep(2)} className="w-full py-3 bg-[#2d6a4f] text-white font-semibold rounded-lg hover:bg-[#1b4332] transition-colors flex items-center justify-center gap-2">
                  Next <ArrowRight className="w-5 h-5" />
                </button>
              </>
            )}

            {step === 2 && (
              <>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">Address</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-3.5 w-5 h-5 text-stone-400" />
                    <textarea value={form.address} onChange={e => update('address', e.target.value)} className="w-full pl-12 pr-4 py-3 border border-stone-300 rounded-lg bg-white transition-all resize-none" rows="2" placeholder="Enter your address" required />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">Number of Residents</label>
                  <div className="relative">
                    <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                    <input type="number" min="1" max="20" value={form.numResidents} onChange={e => update('numResidents', parseInt(e.target.value))} className="w-full pl-12 pr-4 py-3 border border-stone-300 rounded-lg bg-white transition-all" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">Ward</label>
                  <div className="relative">
                    <Home className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                    <select value={form.ward} onChange={e => update('ward', e.target.value)} className="w-full pl-12 pr-4 py-3 border border-stone-300 rounded-lg bg-white transition-all appearance-none">
                      <option>Ward 1</option>
                      <option>Ward 2</option>
                      <option>Ward 3</option>
                    </select>
                  </div>
                </div>
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700 flex items-start gap-3">
                  <MapPin className="w-5 h-5 mt-0.5 flex-shrink-0" />
                  <p>Your GPS location will be captured automatically to optimize waste collection routes in your area.</p>
                </div>
                <div className="flex gap-3">
                  <button type="button" onClick={() => setStep(1)} className="flex-1 py-3 border border-stone-300 text-stone-700 font-semibold rounded-lg hover:bg-stone-50 transition-all">
                    Back
                  </button>
                  <button type="submit" disabled={loading} className="flex-1 py-3 bg-[#2d6a4f] text-white font-semibold rounded-lg hover:bg-[#1b4332] transition-colors flex items-center justify-center gap-2 disabled:opacity-60">
                    {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Register'}
                  </button>
                </div>
              </>
            )}
          </form>

          <p className="mt-6 text-center text-stone-500">
            Already have an account? <Link to="/login" className="text-[#2d6a4f] font-semibold hover:text-[#1b4332]">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
