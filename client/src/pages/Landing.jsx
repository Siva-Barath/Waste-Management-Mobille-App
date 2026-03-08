import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Leaf, Truck, BarChart3, Recycle, ArrowRight, Shield, Clock, Globe, Home, ChevronDown } from 'lucide-react';

export default function Landing() {
  const [showLoginMenu, setShowLoginMenu] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setShowLoginMenu(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="min-h-screen bg-[#fafaf8]">
      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 bg-white border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#2d6a4f] flex items-center justify-center">
              <Recycle className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-[#1b4332]">EcoCircle</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-stone-600">
            <a href="#features" className="hover:text-[#2d6a4f] transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-[#2d6a4f] transition-colors">How It Works</a>
            <a href="#impact" className="hover:text-[#2d6a4f] transition-colors">Impact</a>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setShowLoginMenu(!showLoginMenu)}
                className="px-5 py-2.5 text-sm font-medium text-[#2d6a4f] hover:text-[#1b4332] transition-colors flex items-center gap-1"
              >
                Sign In
                <ChevronDown className={`w-4 h-4 transition-transform ${showLoginMenu ? 'rotate-180' : ''}`} />
              </button>
              {showLoginMenu && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-lg border border-stone-200 py-2 z-50">
                  <Link to="/login/resident" className="flex items-center gap-3 px-4 py-3 hover:bg-[#d8f3dc]/40 transition-colors">
                    <div className="w-8 h-8 rounded-lg bg-[#d8f3dc] flex items-center justify-center">
                      <Home className="w-4 h-4 text-[#2d6a4f]" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-stone-800">Resident</p>
                      <p className="text-xs text-stone-400">Household login</p>
                    </div>
                  </Link>
                  <Link to="/login/driver" className="flex items-center gap-3 px-4 py-3 hover:bg-[#52796f]/10 transition-colors">
                    <div className="w-8 h-8 rounded-lg bg-[#52796f]/15 flex items-center justify-center">
                      <Truck className="w-4 h-4 text-[#52796f]" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-stone-800">Driver</p>
                      <p className="text-xs text-stone-400">Collection crew</p>
                    </div>
                  </Link>
                  <Link to="/login/admin" className="flex items-center gap-3 px-4 py-3 hover:bg-[#1b4332]/10 transition-colors">
                    <div className="w-8 h-8 rounded-lg bg-[#1b4332]/10 flex items-center justify-center">
                      <Shield className="w-4 h-4 text-[#1b4332]" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-stone-800">Admin</p>
                      <p className="text-xs text-stone-400">Municipality panel</p>
                    </div>
                  </Link>
                </div>
              )}
            </div>
            <Link to="/register" className="btn-primary text-sm py-2.5 px-5">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero — full-width image */}
      <section className="relative pt-16">
        <div className="relative h-[520px] lg:h-[600px] overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=1400&q=80"
            alt="Waste management and recycling"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" />
          <div className="relative z-10 max-w-7xl mx-auto px-6 h-full flex items-center">
            <div className="max-w-xl">
              <span className="inline-block px-3 py-1 text-xs font-semibold tracking-wide uppercase bg-white/20 text-white rounded mb-5 backdrop-blur-sm">
                Smart Waste Collection
              </span>
              <h1 className="text-4xl lg:text-5xl font-bold text-white leading-tight mb-5">
                Building Cleaner Communities, Together
              </h1>
              <p className="text-lg text-stone-200 mb-8 leading-relaxed">
                AI-optimized collection routes, real-time tracking, and a transparent rewards system — making responsible waste management effortless.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/register" className="btn-primary text-base px-8 py-3.5">
                  Start Contributing
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <a href="#how-it-works" className="btn-secondary text-base px-8 py-3.5 border-white text-white hover:bg-white hover:text-[#1b4332]">
                  Learn More
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust bar */}
      <section className="bg-white border-b border-stone-100">
        <div className="max-w-5xl mx-auto px-6 py-6 flex flex-wrap justify-center gap-10 text-sm text-stone-500">
          <div className="flex items-center gap-2"><Shield className="w-4 h-4 text-[#2d6a4f]" /> Secure & Private</div>
          <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-[#d4a373]" /> Real-time Tracking</div>
          <div className="flex items-center gap-2"><Globe className="w-4 h-4 text-[#52796f]" /> Multi-language Support</div>
          <div className="flex items-center gap-2"><Recycle className="w-4 h-4 text-[#2d6a4f]" /> AI-Powered</div>
        </div>
      </section>

      {/* Features — image cards */}
      <section id="features" className="py-20 px-6 bg-[#fafaf8]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="section-title text-3xl font-bold text-stone-900 mb-4">How We Help</h2>
            <p className="text-stone-500 max-w-xl mx-auto mt-6">Our platform combines AI, optimized logistics, and community incentives to build a truly circular waste economy.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                img: 'https://images.unsplash.com/photo-1604187351574-c75ca79f5807?w=600&q=80',
                icon: <Recycle className="w-6 h-6" />,
                title: 'AI Waste Classification',
                desc: 'Automatically classify waste as biodegradable, recyclable, or hazardous using computer vision at the point of collection.',
              },
              {
                img: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&q=80',
                icon: <Truck className="w-6 h-6" />,
                title: 'Route Optimization',
                desc: 'Smart algorithms calculate the most efficient collection routes, reducing fuel consumption and carbon emissions by up to 40%.',
              },
              {
                img: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=600&q=80',
                icon: <BarChart3 className="w-6 h-6" />,
                title: 'Incentive Rewards',
                desc: 'Earn green points for proper waste segregation. A transparent reward system promotes responsible waste disposal.',
              },
            ].map((f, i) => (
              <div key={i} className="card overflow-hidden group">
                <div className="h-48 overflow-hidden">
                  <img src={f.img} alt={f.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="p-6">
                  <div className="w-10 h-10 rounded-lg bg-[#d8f3dc] text-[#2d6a4f] flex items-center justify-center mb-4">
                    {f.icon}
                  </div>
                  <h3 className="text-lg font-bold text-stone-900 mb-2">{f.title}</h3>
                  <p className="text-sm text-stone-500 leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="py-20 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="section-title text-3xl font-bold text-stone-900 mb-4">How It Works</h2>
            <p className="text-stone-500 mt-6">Four simple steps to a cleaner neighbourhood</p>
          </div>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: '1', title: 'Register', desc: 'Create your household account with GPS location', img: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&q=80' },
              { step: '2', title: 'Report', desc: 'Tell us if you have garbage for collection', img: 'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?w=400&q=80' },
              { step: '3', title: 'Optimize', desc: 'AI calculates the best route for trucks', img: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&q=80' },
              { step: '4', title: 'Collect', desc: 'Trucks follow optimized routes efficiently', img: 'https://images.unsplash.com/photo-1616432043562-3671ea2e5242?w=400&q=80' },
            ].map((s, i) => (
              <div key={i} className="text-center">
                <div className="w-full h-36 rounded-xl overflow-hidden mb-4">
                  <img src={s.img} alt={s.title} className="w-full h-full object-cover" />
                </div>
                <div className="w-8 h-8 mx-auto mb-3 rounded-full bg-[#2d6a4f] text-white flex items-center justify-center text-sm font-bold">
                  {s.step}
                </div>
                <h3 className="font-bold text-stone-900 mb-1">{s.title}</h3>
                <p className="text-sm text-stone-500">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Impact Stats — image background */}
      <section id="impact" className="relative py-20 px-6">
        <img
          src="https://images.unsplash.com/photo-1495556650867-99590cea3657?w=1400&q=80"
          alt="Green environment"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-[#1b4332]/85" />
        <div className="relative z-10 max-w-5xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-2">Environmental Impact</h2>
          <p className="text-stone-300 mb-12">Together, we are building a sustainable future</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { val: '12,000+', label: 'Households Connected' },
              { val: '40%', label: 'Emission Reduction' },
              { val: '95%', label: 'Segregation Accuracy' },
              { val: '₹2.5L', label: 'Rewards Distributed' },
            ].map((s, i) => (
              <div key={i}>
                <p className="text-4xl font-extrabold text-white">{s.val}</p>
                <p className="text-stone-300 text-sm mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Login Portals */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="section-title text-3xl font-bold text-stone-900 mb-4">Choose Your Portal</h2>
            <p className="text-stone-500 mt-6">Sign in based on your role to access the right dashboard</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <Link to="/login/resident" className="card p-8 text-center group hover:border-[#2d6a4f] transition-colors">
              <div className="w-14 h-14 mx-auto mb-5 rounded-xl bg-[#d8f3dc] text-[#2d6a4f] flex items-center justify-center group-hover:scale-110 transition-transform">
                <Home className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-stone-900 mb-2">Resident Login</h3>
              <p className="text-sm text-stone-500 leading-relaxed">Report garbage, track collections, earn rewards for proper waste segregation.</p>
              <span className="inline-flex items-center gap-1 mt-4 text-sm font-semibold text-[#2d6a4f]">
                Sign In <ArrowRight className="w-4 h-4" />
              </span>
            </Link>
            <Link to="/login/driver" className="card p-8 text-center group hover:border-[#52796f] transition-colors">
              <div className="w-14 h-14 mx-auto mb-5 rounded-xl bg-[#52796f]/15 text-[#52796f] flex items-center justify-center group-hover:scale-110 transition-transform">
                <Truck className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-stone-900 mb-2">Driver Login</h3>
              <p className="text-sm text-stone-500 leading-relaxed">View collection routes, navigate to stops, update collection status in real-time.</p>
              <span className="inline-flex items-center gap-1 mt-4 text-sm font-semibold text-[#52796f]">
                Sign In <ArrowRight className="w-4 h-4" />
              </span>
            </Link>
            <Link to="/login/admin" className="card p-8 text-center group hover:border-[#1b4332] transition-colors">
              <div className="w-14 h-14 mx-auto mb-5 rounded-xl bg-[#1b4332]/10 text-[#1b4332] flex items-center justify-center group-hover:scale-110 transition-transform">
                <Shield className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-stone-900 mb-2">Admin Login</h3>
              <p className="text-sm text-stone-500 leading-relaxed">Municipality panel to monitor reports, manage routes, and analyse waste data.</p>
              <span className="inline-flex items-center gap-1 mt-4 text-sm font-semibold text-[#1b4332]">
                Sign In <ArrowRight className="w-4 h-4" />
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 bg-[#fafaf8]">
        <div className="max-w-3xl mx-auto text-center">
          <Leaf className="w-10 h-10 text-[#2d6a4f] mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-stone-900 mb-4">Ready to Make a Difference?</h2>
          <p className="text-stone-500 mb-8 text-lg">Join thousands of households already contributing to a cleaner, greener community through smart waste management.</p>
          <Link to="/register" className="btn-primary text-base px-10 py-4">
            Join EcoCircle Today
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 px-6 bg-[#1b4332] text-stone-400">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#2d6a4f] flex items-center justify-center">
                <Recycle className="w-5 h-5 text-white" />
              </div>
              <span className="text-white font-bold">EcoCircle</span>
            </div>
            <p className="text-sm">Circular Waste Intelligence System &copy; {new Date().getFullYear()}</p>
            <div className="flex gap-6 text-sm">
              <span className="hover:text-white cursor-pointer transition-colors">Privacy</span>
              <span className="hover:text-white cursor-pointer transition-colors">Terms</span>
              <span className="hover:text-white cursor-pointer transition-colors">Contact</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
