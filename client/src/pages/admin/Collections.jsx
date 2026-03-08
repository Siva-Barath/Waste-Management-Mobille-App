import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import api from '../../api';
import { BarChart3, Home as HomeIcon, ClipboardList, CheckCircle, XCircle, Clock, SkipForward, MapPin, Truck } from 'lucide-react';

const navItems = [
  { to: '/admin', label: 'Dashboard', icon: <BarChart3 className="w-4 h-4" />, end: true },
  { to: '/admin/collections', label: 'Collections', icon: <ClipboardList className="w-4 h-4" /> },
  { to: '/admin/households', label: 'Households', icon: <HomeIcon className="w-4 h-4" /> },
  { to: '/admin/drivers', label: 'Drivers', icon: <Truck className="w-4 h-4" /> },
];

const statusConfig = {
  collected: { icon: <CheckCircle className="w-4 h-4" />, bg: 'bg-green-100', text: 'text-green-700' },
  pending: { icon: <Clock className="w-4 h-4" />, bg: 'bg-blue-100', text: 'text-blue-700' },
  skipped: { icon: <SkipForward className="w-4 h-4" />, bg: 'bg-amber-100', text: 'text-amber-700' },
  closed: { icon: <XCircle className="w-4 h-4" />, bg: 'bg-stone-100', text: 'text-stone-700' },
};

export default function AdminCollections() {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    api.get('/admin/collections').then(res => setCollections(res.data.collections)).finally(() => setLoading(false));
  }, []);

  const filtered = filter === 'all' ? collections : collections.filter(c => c.status === filter);

  const counts = {
    all: collections.length,
    pending: collections.filter(c => c.status === 'pending').length,
    collected: collections.filter(c => c.status === 'collected').length,
    skipped: collections.filter(c => c.status === 'skipped').length,
  };

  return (
    <Layout navItems={navItems}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-stone-900">Collection Status</h1>
          <p className="text-stone-500 mt-1">Today&apos;s garbage collection tracking</p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          {[
            { key: 'all', label: 'All' },
            { key: 'pending', label: 'Pending' },
            { key: 'collected', label: 'Collected' },
            { key: 'skipped', label: 'Skipped' },
          ].map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filter === f.key
                  ? 'bg-[#2d6a4f] text-white'
                  : 'bg-white text-stone-600 hover:bg-stone-50 border border-stone-200'
              }`}
            >
              {f.label} ({counts[f.key] || 0})
            </button>
          ))}
        </div>

        {/* Collections List */}
        <div className="card rounded-xl overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="w-8 h-8 border-3 border-[#2d6a4f] border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center text-stone-500">
              <ClipboardList className="w-12 h-12 mx-auto mb-3 text-stone-300" />
              <p>No collections found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-stone-50 text-left">
                    <th className="px-5 py-3 font-semibold text-stone-700">Household</th>
                    <th className="px-5 py-3 font-semibold text-stone-700">Resident</th>
                    <th className="px-5 py-3 font-semibold text-stone-700">Ward</th>
                    <th className="px-5 py-3 font-semibold text-stone-700">Address</th>
                    <th className="px-5 py-3 font-semibold text-stone-700">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {filtered.map((c, i) => {
                    const s = statusConfig[c.status] || statusConfig.pending;
                    return (
                      <tr key={i} className="hover:bg-stone-50 transition-colors">
                        <td className="px-5 py-3 font-medium text-stone-900">{c.household_id}</td>
                        <td className="px-5 py-3 text-stone-700">{c.resident_name}</td>
                        <td className="px-5 py-3">
                          <span className="inline-flex items-center gap-1 text-xs font-medium bg-[#d8f3dc] text-[#2d6a4f] px-2 py-1 rounded-full">
                            <MapPin className="w-3 h-3" />{c.ward}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-stone-600 max-w-xs truncate">{c.address}</td>
                        <td className="px-5 py-3">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${s.bg} ${s.text}`}>
                            {s.icon} {c.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
