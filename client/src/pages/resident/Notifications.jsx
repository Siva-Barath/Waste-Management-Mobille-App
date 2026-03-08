import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import api from '../../api';
import { Home, Clock, Award, Truck, BarChart3, Bell, BellOff, CheckCheck, AlertCircle, Info, Megaphone } from 'lucide-react';

const navItems = [
  { to: '/resident', label: 'Home', icon: <Home className="w-4 h-4" />, end: true },
  { to: '/resident/collections', label: 'Collection', icon: <Truck className="w-4 h-4" /> },
  { to: '/resident/history', label: 'History', icon: <Clock className="w-4 h-4" /> },
  { to: '/resident/stats', label: 'Stats', icon: <BarChart3 className="w-4 h-4" /> },
  { to: '/resident/incentives', label: 'Rewards', icon: <Award className="w-4 h-4" /> },
  { to: '/resident/notifications', label: 'Alerts', icon: <Bell className="w-4 h-4" /> },
];

const typeConfig = {
  reminder: { icon: <Bell className="w-5 h-5" />, bg: 'bg-blue-100', text: 'text-blue-600' },
  alert: { icon: <AlertCircle className="w-5 h-5" />, bg: 'bg-red-100', text: 'text-red-600' },
  info: { icon: <Info className="w-5 h-5" />, bg: 'bg-teal-100', text: 'text-teal-600' },
  announcement: { icon: <Megaphone className="w-5 h-5" />, bg: 'bg-amber-100', text: 'text-amber-600' },
};

export default function ResidentNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data.notifications);
    } catch { /* ignore */ }
    setLoading(false);
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: 1 } : n));
    } catch { /* ignore */ }
  };

  const markAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, read: 1 })));
    } catch { /* ignore */ }
  };

  const unread = notifications.filter(n => !n.read).length;

  const formatTime = (ts) => {
    const d = new Date(ts);
    const now = new Date();
    const diffMs = now - d;
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHrs = Math.floor(diffMins / 60);
    if (diffHrs < 24) return `${diffHrs}h ago`;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <Layout navItems={navItems}>
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-stone-900">Notifications</h1>
            <p className="text-stone-500 mt-1">
              {unread > 0 ? `${unread} unread notification${unread > 1 ? 's' : ''}` : 'All caught up!'}
            </p>
          </div>
          {unread > 0 && (
            <button
              onClick={markAllRead}
              className="px-4 py-2 text-sm font-medium text-[#2d6a4f] bg-[#d8f3dc] rounded-lg hover:bg-[#b7e4c7] transition-colors flex items-center gap-2"
            >
              <CheckCheck className="w-4 h-4" />
              Mark all read
            </button>
          )}
        </div>

        <div className="card rounded-xl overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="w-8 h-8 border-3 border-[#2d6a4f] border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-12 text-center text-stone-500">
              <BellOff className="w-12 h-12 mx-auto mb-3 text-stone-300" />
              <p className="font-medium">No notifications yet</p>
              <p className="text-sm mt-1">You&apos;ll receive alerts about collections, rewards, and system updates here.</p>
            </div>
          ) : (
            <div className="divide-y divide-stone-100">
              {notifications.map((n) => {
                const cfg = typeConfig[n.type] || typeConfig.reminder;
                return (
                  <div
                    key={n.id}
                    onClick={() => !n.read && markRead(n.id)}
                    className={`flex items-start gap-4 p-4 transition-colors cursor-pointer ${
                      n.read ? 'bg-white hover:bg-stone-50' : 'bg-[#d8f3dc]/20 hover:bg-[#d8f3dc]/30'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-lg ${cfg.bg} ${cfg.text} flex items-center justify-center flex-shrink-0`}>
                      {cfg.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm ${n.read ? 'text-stone-600' : 'text-stone-900 font-medium'}`}>
                        {n.message}
                      </p>
                      <p className="text-xs text-stone-400 mt-1">{formatTime(n.created_at)}</p>
                    </div>
                    {!n.read && (
                      <div className="w-2.5 h-2.5 rounded-full bg-[#2d6a4f] flex-shrink-0 mt-2" />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
