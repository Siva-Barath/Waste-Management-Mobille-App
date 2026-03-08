import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import api from '../../api';
import { Home, Clock, Award, Truck, CheckCircle, XCircle, MapPin, Phone, BarChart3, Bell, Navigation, Package, SkipForward, AlertCircle } from 'lucide-react';

const navItems = [
  { to: '/resident', label: 'Home', icon: <Home className="w-4 h-4" />, end: true },
  { to: '/resident/collections', label: 'Collection', icon: <Truck className="w-4 h-4" /> },
  { to: '/resident/history', label: 'History', icon: <Clock className="w-4 h-4" /> },
  { to: '/resident/stats', label: 'Stats', icon: <BarChart3 className="w-4 h-4" /> },
  { to: '/resident/incentives', label: 'Rewards', icon: <Award className="w-4 h-4" /> },
  { to: '/resident/notifications', label: 'Alerts', icon: <Bell className="w-4 h-4" /> },
];

const statusConfig = {
  collected: { label: 'Collected', icon: <CheckCircle className="w-5 h-5" />, bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200' },
  pending: { label: 'Pending', icon: <Clock className="w-5 h-5" />, bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200' },
  skipped: { label: 'Skipped', icon: <SkipForward className="w-5 h-5" />, bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200' },
  closed: { label: 'Closed', icon: <XCircle className="w-5 h-5" />, bg: 'bg-stone-100', text: 'text-stone-600', border: 'border-stone-200' },
};

export default function ResidentCollections() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStatus = async () => {
    try {
      const res = await api.get('/garbage/collection-status');
      setData(res.data);
    } catch { /* ignore */ }
    setLoading(false);
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const formatDate = (dateStr) => {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  if (loading) {
    return (
      <Layout navItems={navItems}>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-[#2d6a4f] border-t-transparent rounded-full animate-spin" />
        </div>
      </Layout>
    );
  }

  const collection = data?.collection;
  const route = data?.routeProgress;
  const status = collection ? statusConfig[collection.status] || statusConfig.pending : null;

  return (
    <Layout navItems={navItems}>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-stone-900">Collection Tracking</h1>
          <p className="text-stone-500 mt-1">Track today&apos;s garbage pickup status in real-time</p>
        </div>

        {/* Today's Status Hero */}
        <div className="card rounded-xl overflow-hidden border-2 border-[#d8f3dc]">
          {!data?.reported ? (
            <div className="p-8 text-center">
              <div className="w-20 h-20 mx-auto mb-5 rounded-full bg-stone-100 flex items-center justify-center">
                <Package className="w-10 h-10 text-stone-400" />
              </div>
              <h2 className="text-xl font-bold text-stone-900 mb-2">No Report Today</h2>
              <p className="text-stone-500 mb-4">You haven&apos;t reported garbage for today yet.</p>
              <a href="/resident" className="inline-flex items-center gap-2 px-6 py-3 bg-[#2d6a4f] text-white font-semibold rounded-lg hover:bg-[#1b4332] transition-colors">
                <Home className="w-5 h-5" />
                Go to Dashboard to Report
              </a>
            </div>
          ) : !data?.todayReport?.available ? (
            <div className="p-8 text-center">
              <div className="w-20 h-20 mx-auto mb-5 rounded-full bg-stone-100 flex items-center justify-center">
                <XCircle className="w-10 h-10 text-stone-400" />
              </div>
              <h2 className="text-xl font-bold text-stone-900 mb-2">No Garbage Reported</h2>
              <p className="text-stone-500">You reported no garbage for today. No collection expected.</p>
            </div>
          ) : (
            <div className="p-6 sm:p-8">
              {/* Status Badge */}
              <div className="flex flex-col sm:flex-row items-center gap-6 mb-8">
                <div className={`w-24 h-24 rounded-2xl ${status ? status.bg : 'bg-blue-100'} flex items-center justify-center`}>
                  <div className={`${status ? status.text : 'text-blue-700'} scale-[2]`}>
                    {status ? status.icon : <Clock className="w-5 h-5" />}
                  </div>
                </div>
                <div className="text-center sm:text-left">
                  <h2 className="text-2xl font-bold text-stone-900">
                    {status ? status.label : 'Awaiting Assignment'}
                  </h2>
                  <p className="text-stone-500 mt-1">
                    {collection?.status === 'collected'
                      ? 'Your garbage has been collected successfully!'
                      : collection?.status === 'skipped'
                      ? 'Collection was skipped at your location.'
                      : collection?.status === 'pending'
                      ? 'A truck is assigned and on the way.'
                      : 'Your garbage report is pending assignment to a driver.'}
                  </p>
                  {data?.todayReport?.waste_type && (
                    <span className="inline-block mt-2 px-3 py-1 bg-[#d8f3dc] text-[#2d6a4f] rounded-full text-sm font-medium">
                      Waste Type: {data.todayReport.waste_type}
                    </span>
                  )}
                </div>
              </div>

              {/* Driver & Route Info */}
              {collection && (
                <div className="grid sm:grid-cols-2 gap-4 mb-6">
                  {collection.driver_name && (
                    <div className="p-4 rounded-xl bg-[#fafaf8] border border-stone-200">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-lg bg-[#52796f]/15 flex items-center justify-center">
                          <Truck className="w-5 h-5 text-[#52796f]" />
                        </div>
                        <div>
                          <p className="text-xs text-stone-500">Assigned Driver</p>
                          <p className="font-bold text-stone-900">{collection.driver_name}</p>
                        </div>
                      </div>
                      {collection.driver_phone && (
                        <div className="flex items-center gap-2 text-sm text-stone-600">
                          <Phone className="w-4 h-4 text-stone-400" />
                          {collection.driver_phone}
                        </div>
                      )}
                    </div>
                  )}

                  {route && (
                    <div className="p-4 rounded-xl bg-[#fafaf8] border border-stone-200">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-lg bg-[#d8f3dc] flex items-center justify-center">
                          <Navigation className="w-5 h-5 text-[#2d6a4f]" />
                        </div>
                        <div>
                          <p className="text-xs text-stone-500">Route Info</p>
                          <p className="font-bold text-stone-900">Stop #{route.householdPosition} of {route.totalStops}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-stone-600">
                        <span>{route.totalDistance} km</span>
                        <span>~{route.estimatedTime} min</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Route Progress Bar */}
              {route && (
                <div className="p-4 rounded-xl bg-white border border-stone-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-stone-700">Route Progress</span>
                    <span className="text-sm font-bold text-[#2d6a4f]">
                      {route.totalStops > 0 ? Math.round((route.completedStops / route.totalStops) * 100) : 0}%
                    </span>
                  </div>
                  <div className="w-full h-3 bg-stone-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#2d6a4f] rounded-full transition-all duration-500"
                      style={{ width: `${route.totalStops > 0 ? (route.completedStops / route.totalStops) * 100 : 0}%` }}
                    />
                  </div>
                  <div className="flex justify-between mt-2 text-xs text-stone-500">
                    <span>{route.completedStops} completed</span>
                    <span>{route.pendingStops} remaining</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Recent Collections */}
        {data?.recentCollections && data.recentCollections.length > 0 && (
          <div className="card rounded-xl overflow-hidden">
            <div className="p-5 border-b border-stone-100 flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#2d6a4f]" />
              <h2 className="font-bold text-stone-900">Recent Collections</h2>
            </div>
            <div className="divide-y divide-stone-100">
              {data.recentCollections.map((c, i) => {
                const cfg = statusConfig[c.status] || statusConfig.pending;
                return (
                  <div key={i} className="flex items-center justify-between p-4 hover:bg-stone-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg ${cfg.bg} flex items-center justify-center ${cfg.text}`}>
                        {cfg.icon}
                      </div>
                      <div>
                        <p className="font-medium text-stone-900">{formatDate(c.date)}</p>
                        {c.driver_name && (
                          <p className="text-xs text-stone-500">Driver: {c.driver_name}</p>
                        )}
                      </div>
                    </div>
                    <span className={`text-xs font-semibold px-3 py-1.5 rounded-full ${cfg.bg} ${cfg.text}`}>
                      {cfg.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Info Note */}
        <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-xl">
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-blue-800">How tracking works</p>
            <p className="text-sm text-blue-700 mt-1">
              After you report garbage on the dashboard, the admin assigns a driver and optimizes the route. 
              You can track the driver&apos;s progress here. This page refreshes automatically every 30 seconds.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
