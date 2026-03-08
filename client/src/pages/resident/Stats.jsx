import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import api from '../../api';
import { Home, Clock, Award, BarChart3, Truck, Bell, TrendingUp, Recycle, CheckCircle, XCircle, Leaf, AlertTriangle, Trash2, Sparkles, Target } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, CartesianGrid } from 'recharts';

const navItems = [
  { to: '/resident', label: 'Home', icon: <Home className="w-4 h-4" />, end: true },
  { to: '/resident/collections', label: 'Collection', icon: <Truck className="w-4 h-4" /> },
  { to: '/resident/history', label: 'History', icon: <Clock className="w-4 h-4" /> },
  { to: '/resident/stats', label: 'Stats', icon: <BarChart3 className="w-4 h-4" /> },
  { to: '/resident/incentives', label: 'Rewards', icon: <Award className="w-4 h-4" /> },
  { to: '/resident/notifications', label: 'Alerts', icon: <Bell className="w-4 h-4" /> },
];

const COLORS = ['#2d6a4f', '#52796f', '#d4a373', '#b56576'];

const wasteLabels = {
  biodegradable: { label: 'Biodegradable', icon: <Leaf className="w-4 h-4" /> },
  recyclable: { label: 'Recyclable', icon: <Recycle className="w-4 h-4" /> },
  hazardous: { label: 'Hazardous', icon: <AlertTriangle className="w-4 h-4" /> },
  mixed: { label: 'Mixed', icon: <Trash2 className="w-4 h-4" /> },
};

export default function ResidentStats() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/garbage/my-stats').then(res => setStats(res.data)).finally(() => setLoading(false));
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
  const trendData = (stats?.weeklyTrend || []).map(d => ({
    date: d.date.split('-').slice(1).join('/'),
    Reported: d.reported,
    Collected: d.collected
  }));

  return (
    <Layout navItems={navItems}>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-stone-900">My Statistics</h1>
          <p className="text-stone-500 mt-1">Your personal waste management analytics</p>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="card rounded-xl p-5">
            <div className="w-10 h-10 rounded-lg bg-[#d8f3dc] flex items-center justify-center mb-3">
              <BarChart3 className="w-5 h-5 text-[#2d6a4f]" />
            </div>
            <p className="text-2xl font-bold text-stone-900">{o.totalReports || 0}</p>
            <p className="text-xs text-stone-500">Total Reports</p>
          </div>
          <div className="card rounded-xl p-5">
            <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center mb-3">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
            </div>
            <p className="text-2xl font-bold text-emerald-600">{o.totalCollected || 0}</p>
            <p className="text-xs text-stone-500">Times Collected</p>
          </div>
          <div className="card rounded-xl p-5">
            <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center mb-3">
              <XCircle className="w-5 h-5 text-amber-600" />
            </div>
            <p className="text-2xl font-bold text-amber-600">{o.totalSkipped || 0}</p>
            <p className="text-xs text-stone-500">Skipped/Closed</p>
          </div>
          <div className="card rounded-xl p-5">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center mb-3">
              <Sparkles className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-blue-600">{o.totalPoints || 0}</p>
            <p className="text-xs text-stone-500">Green Points</p>
          </div>
        </div>

        {/* Score Cards */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="card rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-[#d8f3dc] flex items-center justify-center">
                <Target className="w-5 h-5 text-[#2d6a4f]" />
              </div>
              <div>
                <p className="text-sm text-stone-500">Collection Success Rate</p>
                <p className="text-3xl font-bold text-[#2d6a4f]">{o.collectionRate || 0}%</p>
              </div>
            </div>
            <div className="w-full h-3 bg-stone-200 rounded-full overflow-hidden">
              <div className="h-full bg-[#2d6a4f] rounded-full transition-all" style={{ width: `${o.collectionRate || 0}%` }} />
            </div>
            <p className="text-xs text-stone-500 mt-2">{o.totalCollected} collected out of {o.totalGarbageDays} garbage days</p>
          </div>

          <div className="card rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-teal-100 flex items-center justify-center">
                <Recycle className="w-5 h-5 text-teal-600" />
              </div>
              <div>
                <p className="text-sm text-stone-500">Segregation Score</p>
                <p className="text-3xl font-bold text-teal-600">{o.segregationScore || 0}%</p>
              </div>
            </div>
            <div className="w-full h-3 bg-stone-200 rounded-full overflow-hidden">
              <div className="h-full bg-teal-500 rounded-full transition-all" style={{ width: `${o.segregationScore || 0}%` }} />
            </div>
            <p className="text-xs text-stone-500 mt-2">Properly segregated waste earns bonus points</p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Weekly Trend */}
          <div className="card rounded-xl p-6">
            <h3 className="font-bold text-stone-900 mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[#2d6a4f]" />
              14-Day Reporting Trend
            </h3>
            <div className="h-56">
              {trendData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#a8a29e" />
                    <YAxis tick={{ fontSize: 11 }} stroke="#a8a29e" allowDecimals={false} />
                    <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #d6d3d1', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }} />
                    <Area type="monotone" dataKey="Reported" stroke="#2d6a4f" fill="#d8f3dc" strokeWidth={2} />
                    <Area type="monotone" dataKey="Collected" stroke="#52796f" fill="#b7e4c7" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-stone-400">No data yet</div>
              )}
            </div>
          </div>

          {/* Waste Type Distribution */}
          <div className="card rounded-xl p-6">
            <h3 className="font-bold text-stone-900 mb-4 flex items-center gap-2">
              <Recycle className="w-5 h-5 text-[#52796f]" />
              Waste Type Breakdown
            </h3>
            <div className="h-56 flex items-center">
              {wasteData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={wasteData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {wasteData.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #d6d3d1' }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center w-full text-stone-400">No data yet</div>
              )}
            </div>
            <div className="flex flex-wrap gap-3 justify-center mt-2">
              {wasteData.map((w, i) => {
                const wl = wasteLabels[w.name] || { label: w.name };
                return (
                  <span key={i} className="flex items-center gap-1.5 text-xs text-stone-600">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                    {wl.label}: {w.value}
                  </span>
                );
              })}
            </div>
          </div>
        </div>

        {/* How Data Flows */}
        <div className="card rounded-xl p-6">
          <h3 className="font-bold text-stone-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[#52796f]" />
            How Your Data Helps
          </h3>
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-[#d8f3dc] border border-green-200 text-center">
              <Home className="w-8 h-8 mx-auto mb-2 text-[#2d6a4f]" />
              <p className="font-bold text-[#1b4332] text-sm">You Report</p>
              <p className="text-xs text-[#2d6a4f] mt-1">Your daily garbage & waste type data is recorded</p>
            </div>
            <div className="p-4 rounded-xl bg-[#52796f]/10 border border-[#52796f]/20 text-center">
              <Truck className="w-8 h-8 mx-auto mb-2 text-[#52796f]" />
              <p className="font-bold text-[#52796f] text-sm">Drivers Collect</p>
              <p className="text-xs text-[#52796f] mt-1">AI optimizes routes based on your reports</p>
            </div>
            <div className="p-4 rounded-xl bg-[#1b4332]/10 border border-[#1b4332]/20 text-center">
              <BarChart3 className="w-8 h-8 mx-auto mb-2 text-[#1b4332]" />
              <p className="font-bold text-[#1b4332] text-sm">Admin Monitors</p>
              <p className="text-xs text-[#1b4332] mt-1">Ward-level insights improve city services</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
