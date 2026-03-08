import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import api from '../../api';
import { BarChart3, Home as HomeIcon, ClipboardList, Users, MapPin, Phone, Search, Truck } from 'lucide-react';

const navItems = [
  { to: '/admin', label: 'Dashboard', icon: <BarChart3 className="w-4 h-4" />, end: true },
  { to: '/admin/collections', label: 'Collections', icon: <ClipboardList className="w-4 h-4" /> },
  { to: '/admin/households', label: 'Households', icon: <HomeIcon className="w-4 h-4" /> },
  { to: '/admin/drivers', label: 'Drivers', icon: <Truck className="w-4 h-4" /> },
];

export default function AdminHouseholds() {
  const [households, setHouseholds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.get('/admin/households').then(res => setHouseholds(res.data.households)).finally(() => setLoading(false));
  }, []);

  const filtered = households.filter(h =>
    h.id.toLowerCase().includes(search.toLowerCase()) ||
    h.name.toLowerCase().includes(search.toLowerCase()) ||
    h.ward.toLowerCase().includes(search.toLowerCase()) ||
    h.address.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Layout navItems={navItems}>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-stone-900">Households</h1>
            <p className="text-stone-500 mt-1">{households.length} registered households</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search households, wards, names..."
            className="w-full pl-12 pr-4 py-3 border border-stone-200 rounded-lg focus:ring-2 focus:ring-[#2d6a4f] focus:border-transparent outline-none bg-white hover:bg-stone-50 transition-all"
          />
        </div>

        {/* Households Grid */}
        {loading ? (
          <div className="p-12 text-center">
            <div className="w-8 h-8 border-3 border-[#2d6a4f] border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((h, i) => (
              <div key={i} className="card rounded-xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-bold text-[#2d6a4f] bg-[#d8f3dc] px-3 py-1 rounded-full">{h.id}</span>
                  <span className="text-xs font-medium text-stone-500 bg-stone-100 px-2 py-1 rounded-full flex items-center gap-1">
                    <MapPin className="w-3 h-3" />{h.ward}
                  </span>
                </div>
                <h3 className="font-bold text-stone-900 mb-1">{h.name}</h3>
                <p className="text-sm text-stone-500 mb-3 truncate">{h.address}</p>
                <div className="flex items-center justify-between text-xs text-stone-500">
                  <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{h.phone}</span>
                  <span className="flex items-center gap-1"><Users className="w-3 h-3" />{h.num_residents} residents</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="text-center p-12 text-stone-500">
            <HomeIcon className="w-12 h-12 mx-auto mb-3 text-stone-300" />
            <p>No households found matching your search.</p>
          </div>
        )}
      </div>
    </Layout>
  );
}
