import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import api from '../../api';
import { BarChart3, Home as HomeIcon, ClipboardList, Users, Truck, TrendingUp, Recycle, CheckCircle, XCircle, Clock, MapPin, Leaf, AlertTriangle, Trash2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, CartesianGrid, Legend, Area, AreaChart } from 'recharts';

const navItems = [
  { to: '/admin', label: 'Dashboard', icon: <BarChart3 className="w-4 h-4" />, end: true },
  { to: '/admin/collections', label: 'Collections', icon: <ClipboardList className="w-4 h-4" /> },
  { to: '/admin/households', label: 'Households', icon: <HomeIcon className="w-4 h-4" /> },
  { to: '/admin/drivers', label: 'Drivers', icon: <Truck className="w-4 h-4" /> },
];

const COLORS = ['#2d6a4f', '#52796f', '#d4a373', '#b56576', '#6366f1', '#457b9d'];

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/stats').then(res => setStats(res.data)).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Layout navItems={navItems}>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-[#2d6a4f] border-t-transparent rounded-full animate-spin" />
        </div>
      </Layout>
    );
  }

  const o = stats?.overview || {};
  const wasteData = (stats?.wasteTypes || []).map(w => ({ name: w.waste_type, value: w.count }));
  const weeklyData = (stats?.weeklyTrend || []).map(d => ({
    date: d.date.split('-').slice(1).join('/'),
    Reported: d.reported,
    Collected: d.collected
  }));

  return (
    <Layout navItems={navItems}>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-stone-900">Admin Dashboard</h1>
          <p className="text-stone-500 mt-1">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Households', value: o.totalHouseholds, icon: <HomeIcon className="w-5 h-5 text-[#2d6a4f]" />, bg: 'bg-[#d8f3dc]' },
            { label: 'Reporting Today', value: o.reportingToday, icon: <ClipboardList className="w-5 h-5 text-[#52796f]" />, bg: 'bg-teal-100' },
            { label: 'Collected Today', value: o.collectedToday, icon: <CheckCircle className="w-5 h-5 text-emerald-600" />, bg: 'bg-emerald-100' },
            { label: 'Pending', value: o.pendingToday, icon: <Clock className="w-5 h-5 text-amber-600" />, bg: 'bg-amber-100' },
          ].map((s, i) => (
            <div key={i} className="card rounded-xl p-5">
              <div className={`w-10 h-10 rounded-lg ${s.bg} flex items-center justify-center mb-3`}>
                {s.icon}
              </div>
              <p className="text-2xl font-bold text-stone-900">{s.value || 0}</p>
              <p className="text-xs text-stone-500">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Secondary Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="card rounded-xl p-5">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-5 h-5 text-[#2d6a4f]" />
              <span className="text-xs font-semibold text-[#2d6a4f] bg-[#d8f3dc] px-2 py-1 rounded-full">Good</span>
            </div>
            <p className="text-3xl font-bold text-stone-900">{o.efficiency || 0}%</p>
            <p className="text-xs text-stone-500">Collection Efficiency</p>
          </div>
          <div className="card rounded-xl p-5">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center mb-3">
              <Truck className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-stone-900">{o.totalDrivers || 0}</p>
            <p className="text-xs text-stone-500">Active Drivers</p>
          </div>
          <div className="card rounded-xl p-5">
            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center mb-3">
              <MapPin className="w-5 h-5 text-purple-600" />
            </div>
            <p className="text-2xl font-bold text-stone-900">{o.activeRoutes || 0}</p>
            <p className="text-xs text-stone-500">Active Routes</p>
          </div>
          <div className="card rounded-xl p-5">
            <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center mb-3">
              <XCircle className="w-5 h-5 text-red-600" />
            </div>
            <p className="text-2xl font-bold text-stone-900">{o.skippedToday || 0}</p>
            <p className="text-xs text-stone-500">Skipped Today</p>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Weekly Trend */}
          <div className="card rounded-xl p-6">
            <h3 className="font-bold text-stone-900 mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[#2d6a4f]" />
              Weekly Collection Trend
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#a8a29e" />
                  <YAxis tick={{ fontSize: 12 }} stroke="#a8a29e" />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #d6d3d1', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }} />
                  <Legend />
                  <Area type="monotone" dataKey="Reported" stroke="#2d6a4f" fill="#d8f3dc" strokeWidth={2} />
                  <Area type="monotone" dataKey="Collected" stroke="#52796f" fill="#b7e4c7" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Waste Distribution */}
          <div className="card rounded-xl p-6">
            <h3 className="font-bold text-stone-900 mb-4 flex items-center gap-2">
              <Recycle className="w-5 h-5 text-[#52796f]" />
              Waste Type Distribution
            </h3>
            <div className="h-64 flex items-center">
              {wasteData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={wasteData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {wasteData.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #d6d3d1', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center w-full text-stone-400">No data</div>
              )}
            </div>
            {/* Legend items */}
            <div className="flex flex-wrap gap-3 justify-center mt-2">
              {wasteData.map((w, i) => (
                <span key={i} className="flex items-center gap-1.5 text-xs text-stone-600">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  {w.name}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Ward Stats */}
        <div className="card rounded-xl p-6">
          <h3 className="font-bold text-stone-900 mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-[#2d6a4f]" />
            Ward-wise Reports
          </h3>
          <div className="grid sm:grid-cols-3 gap-4">
            {(stats?.wardStats || []).map((ward, i) => (
              <div key={i} className="p-4 bg-[#fafaf8] rounded-lg border border-stone-200">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-bold text-stone-900">{ward.ward}</h4>
                  <span className="text-xs bg-[#d8f3dc] text-[#2d6a4f] px-2 py-1 rounded-full">{ward.total_houses} houses</span>
                </div>
                <div className="flex items-end gap-2">
                  <span className="text-3xl font-bold text-[#2d6a4f]">{ward.reporting}</span>
                  <span className="text-sm text-stone-500 mb-1">reporting today</span>
                </div>
                <div className="mt-3 h-2 bg-stone-200 rounded-full overflow-hidden">
                  <div className="h-full bg-[#2d6a4f] rounded-full" style={{ width: `${ward.total_houses > 0 ? (ward.reporting / ward.total_houses) * 100 : 0}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
