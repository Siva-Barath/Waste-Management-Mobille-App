import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import api from '../../api';
import { Home, Clock, Award, CheckCircle, XCircle, Trash2, Recycle, Leaf, AlertTriangle, Calendar, Truck, BarChart3, Bell } from 'lucide-react';

const navItems = [
  { to: '/resident', label: 'Home', icon: <Home className="w-4 h-4" />, end: true },
  { to: '/resident/collections', label: 'Collection', icon: <Truck className="w-4 h-4" /> },
  { to: '/resident/history', label: 'History', icon: <Clock className="w-4 h-4" /> },
  { to: '/resident/stats', label: 'Stats', icon: <BarChart3 className="w-4 h-4" /> },
  { to: '/resident/incentives', label: 'Rewards', icon: <Award className="w-4 h-4" /> },
  { to: '/resident/notifications', label: 'Alerts', icon: <Bell className="w-4 h-4" /> },
];

const wasteIcons = {
  biodegradable: { icon: <Leaf className="w-4 h-4 text-green-600" />, bg: 'bg-green-100', text: 'text-green-700' },
  recyclable: { icon: <Recycle className="w-4 h-4 text-blue-600" />, bg: 'bg-blue-100', text: 'text-blue-700' },
  hazardous: { icon: <AlertTriangle className="w-4 h-4 text-red-600" />, bg: 'bg-red-100', text: 'text-red-700' },
  mixed: { icon: <Trash2 className="w-4 h-4 text-amber-600" />, bg: 'bg-amber-100', text: 'text-amber-700' },
};

export default function ResidentHistory() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/garbage/history').then(res => {
      setReports(res.data.reports);
    }).finally(() => setLoading(false));
  }, []);

  const formatDate = (dateStr) => {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const totalReported = reports.filter(r => r.available).length;
  const totalCollected = reports.filter(r => r.collection_status === 'collected').length;

  return (
    <Layout navItems={navItems}>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-stone-900">Collection History</h1>
          <p className="text-stone-500 mt-1">Your waste reporting and collection records</p>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-3 gap-4">
          <div className="card rounded-xl p-5 text-center">
            <p className="text-3xl font-bold text-stone-900">{reports.length}</p>
            <p className="text-sm text-stone-500">Total Reports</p>
          </div>
          <div className="card rounded-xl p-5 text-center">
            <p className="text-3xl font-bold text-[#2d6a4f]">{totalReported}</p>
            <p className="text-sm text-stone-500">Garbage Days</p>
          </div>
          <div className="card rounded-xl p-5 text-center">
            <p className="text-3xl font-bold text-[#52796f]">{totalCollected}</p>
            <p className="text-sm text-stone-500">Collected</p>
          </div>
        </div>

        {/* Timeline */}
        <div className="card rounded-xl overflow-hidden">
          <div className="p-5 border-b border-stone-100 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[#2d6a4f]" />
            <h2 className="font-bold text-stone-900">Report Timeline</h2>
          </div>

          {loading ? (
            <div className="p-12 text-center">
              <div className="w-8 h-8 border-3 border-[#2d6a4f] border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          ) : reports.length === 0 ? (
            <div className="p-12 text-center text-stone-500">
              <Trash2 className="w-12 h-12 mx-auto mb-3 text-stone-300" />
              <p>No reports yet. Start reporting today!</p>
            </div>
          ) : (
            <div className="divide-y divide-stone-100">
              {reports.map((report, i) => {
                const wt = wasteIcons[report.waste_type] || wasteIcons.mixed;
                return (
                    <div key={i} className="flex items-center gap-4 p-4 hover:bg-stone-50 transition-colors">
                    {/* Date */}
                    <div className="text-center min-w-[60px]">
                      <p className="text-sm font-bold text-stone-900">{formatDate(report.date).split(', ')[0]}</p>
                      <p className="text-xs text-stone-500">{report.date}</p>
                    </div>

                    {/* Timeline dot */}
                    <div className="relative flex flex-col items-center">
                      <div className={`w-3 h-3 rounded-full ${report.available ? 'bg-[#2d6a4f]' : 'bg-stone-300'}`} />
                      {i < reports.length - 1 && <div className="w-0.5 h-8 bg-stone-200 absolute top-3" />}
                    </div>

                    {/* Content */}
                    <div className="flex-1 flex items-center justify-between">
                      <div>
                        <p className="font-medium text-stone-900">
                          {report.available ? 'Garbage Reported' : 'No Garbage'}
                        </p>
                        {report.available && (
                          <span className={`inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${wt.bg} ${wt.text}`}>
                            {wt.icon}
                            {report.waste_type}
                          </span>
                        )}
                      </div>

                      {/* Collection status */}
                      {report.available && (
                        <div>
                          {report.collection_status === 'collected' ? (
                            <span className="flex items-center gap-1 text-xs font-medium text-green-600 bg-green-50 px-3 py-1.5 rounded-full">
                              <CheckCircle className="w-3.5 h-3.5" /> Collected
                            </span>
                          ) : report.collection_status === 'skipped' ? (
                            <span className="flex items-center gap-1 text-xs font-medium text-amber-600 bg-amber-50 px-3 py-1.5 rounded-full">
                              <XCircle className="w-3.5 h-3.5" /> Skipped
                            </span>
                          ) : report.collection_status === 'pending' ? (
                            <span className="flex items-center gap-1 text-xs font-medium text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full">
                              <Clock className="w-3.5 h-3.5" /> Pending
                            </span>
                          ) : null}
                        </div>
                      )}
                    </div>
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
