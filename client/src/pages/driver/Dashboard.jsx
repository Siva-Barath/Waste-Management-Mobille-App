import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import Layout from '../../components/Layout';
import api from '../../api';
import { Map, CheckCircle, XCircle, Navigation, Truck, Home, Clock, SkipForward, DoorClosed, MapPin, Phone, ChevronRight, Flag } from 'lucide-react';

const navItems = [
  { to: '/driver', label: 'Route', icon: <Map className="w-4 h-4" />, end: true },
];

export default function DriverDashboard() {
  const { user } = useAuth();
  const [route, setRoute] = useState(null);
  const [stops, setStops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchRoute();
  }, []);

  const fetchRoute = async () => {
    try {
      const res = await api.get('/routes/today');
      setRoute(res.data.route);
      setStops(res.data.stops || []);
      if (res.data.message) setMessage(res.data.message);
    } catch {
      setMessage('Failed to load route.');
    }
    setLoading(false);
  };

  const updateStatus = async (collectionId, status) => {
    setUpdating(collectionId);
    try {
      await api.put(`/routes/collect/${collectionId}`, { status });
      fetchRoute();
    } catch { /* ignore */ }
    setUpdating(null);
  };

  const completeRoute = async () => {
    if (!route) return;
    try {
      await api.put(`/routes/complete/${route.id}`);
      fetchRoute();
    } catch { /* ignore */ }
  };

  const collected = stops.filter(s => s.collection_status === 'collected').length;
  const pending = stops.filter(s => s.collection_status === 'pending').length;
  const skipped = stops.filter(s => s.collection_status === 'skipped' || s.collection_status === 'closed').length;

  return (
    <Layout navItems={navItems}>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-stone-900">Driver Dashboard</h1>
            <p className="text-stone-500 mt-1">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
          </div>
          {route && route.status === 'active' && pending === 0 && (
            <button onClick={completeRoute} className="px-6 py-3 bg-[#2d6a4f] text-white font-semibold rounded-lg hover:bg-[#1b4332] transition-colors flex items-center gap-2">
              <Flag className="w-5 h-5" />
              Complete Route
            </button>
          )}
        </div>

        {/* Route Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="card rounded-xl p-5 text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-lg bg-blue-100 flex items-center justify-center">
              <MapPin className="w-6 h-6 text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-stone-900">{stops.length}</p>
            <p className="text-xs text-stone-500">Total Stops</p>
          </div>
          <div className="card rounded-xl p-5 text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-lg bg-[#d8f3dc] flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-[#2d6a4f]" />
            </div>
            <p className="text-2xl font-bold text-[#2d6a4f]">{collected}</p>
            <p className="text-xs text-stone-500">Collected</p>
          </div>
          <div className="card rounded-xl p-5 text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-lg bg-amber-100 flex items-center justify-center">
              <Clock className="w-6 h-6 text-amber-600" />
            </div>
            <p className="text-2xl font-bold text-amber-600">{pending}</p>
            <p className="text-xs text-stone-500">Pending</p>
          </div>
          <div className="card rounded-xl p-5 text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-lg bg-stone-100 flex items-center justify-center">
              <SkipForward className="w-6 h-6 text-stone-600" />
            </div>
            <p className="text-2xl font-bold text-stone-600">{skipped}</p>
            <p className="text-xs text-stone-500">Skipped</p>
          </div>
        </div>

        {/* Route Progress */}
        {stops.length > 0 && (
          <div className="card rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-stone-700">Route Progress</span>
              <span className="text-sm font-bold text-[#2d6a4f]">{Math.round((collected / stops.length) * 100)}%</span>
            </div>
            <div className="w-full h-3 bg-stone-200 rounded-full overflow-hidden">
              <div className="h-full bg-[#2d6a4f] rounded-full transition-all duration-500" style={{ width: `${(collected / stops.length) * 100}%` }} />
            </div>
          </div>
        )}

        {/* Route Info */}
        {route && (
          <div className="card rounded-xl p-5 flex flex-wrap gap-6 items-center">
            <div className="flex items-center gap-2 text-sm">
              <Truck className="w-4 h-4 text-[#2d6a4f]" />
              <span className="text-stone-500">Distance:</span>
              <span className="font-bold text-stone-900">{route.total_distance} km</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4 text-blue-600" />
              <span className="text-stone-500">Est. Time:</span>
              <span className="font-bold text-stone-900">{route.estimated_time} min</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Flag className="w-4 h-4 text-[#52796f]" />
              <span className="text-stone-500">Status:</span>
              <span className={`font-bold ${route.status === 'active' ? 'text-[#2d6a4f]' : 'text-stone-600'}`}>{route.status}</span>
            </div>
          </div>
        )}

        {/* Stop List */}
        <div className="card rounded-xl overflow-hidden">
          <div className="p-5 border-b border-stone-100 flex items-center gap-2">
            <Navigation className="w-5 h-5 text-[#2d6a4f]" />
            <h2 className="font-bold text-stone-900">Collection Route</h2>
          </div>

          {loading ? (
            <div className="p-12 text-center">
              <div className="w-8 h-8 border-3 border-[#2d6a4f] border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          ) : message && stops.length === 0 ? (
            <div className="p-12 text-center text-stone-500">
              <Truck className="w-12 h-12 mx-auto mb-3 text-stone-300" />
              <p>{message}</p>
            </div>
          ) : (
            <div>
              {/* Depot Start */}
              <div className="flex items-center gap-4 p-4 bg-[#d8f3dc] border-b border-green-200">
                <div className="w-10 h-10 rounded-lg bg-[#2d6a4f] flex items-center justify-center">
                  <Flag className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-bold text-[#1b4332]">Depot - Start</p>
                  <p className="text-xs text-[#2d6a4f]">Collection starting point</p>
                </div>
              </div>

              {/* Stops */}
              {stops.map((stop, i) => (
                <div key={i} className={`p-4 border-b border-stone-100 ${stop.collection_status === 'collected' ? 'bg-green-50/50' : stop.collection_status === 'pending' ? '' : 'bg-stone-50/50'}`}>
                  <div className="flex items-start gap-4">
                    {/* Stop number */}
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm flex-shrink-0 ${
                      stop.collection_status === 'collected' ? 'bg-green-200 text-green-800' :
                      stop.collection_status === 'pending' ? 'bg-blue-100 text-blue-700' :
                      'bg-stone-200 text-stone-600'
                    }`}>
                      {stop.collection_status === 'collected' ? <CheckCircle className="w-5 h-5" /> : i + 1}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-bold text-stone-900">{stop.id}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          stop.collection_status === 'collected' ? 'bg-green-100 text-green-700' :
                          stop.collection_status === 'pending' ? 'bg-blue-100 text-blue-700' :
                          'bg-stone-100 text-stone-600'
                        }`}>
                          {stop.collection_status || 'pending'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-stone-600 mb-1">
                        <Home className="w-3.5 h-3.5" />
                        <span className="truncate">{stop.address}</span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-stone-500">
                        <span className="flex items-center gap-1"><span className="font-medium">{stop.resident_name}</span></span>
                        <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{stop.resident_phone}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    {stop.collection_status === 'pending' && stop.collection_id && (
                      <div className="flex flex-col sm:flex-row gap-2 flex-shrink-0">
                        <button
                          onClick={() => updateStatus(stop.collection_id, 'collected')}
                          disabled={updating === stop.collection_id}
                          className="px-3 py-2 bg-green-600 text-white text-xs font-semibold rounded-lg hover:bg-green-700 transition-colors flex items-center gap-1 disabled:opacity-50"
                        >
                          <CheckCircle className="w-3.5 h-3.5" /> Collected
                        </button>
                        <button
                          onClick={() => updateStatus(stop.collection_id, 'skipped')}
                          disabled={updating === stop.collection_id}
                          className="px-3 py-2 bg-amber-100 text-amber-700 text-xs font-semibold rounded-lg hover:bg-amber-200 transition-colors flex items-center gap-1 disabled:opacity-50"
                        >
                          <SkipForward className="w-3.5 h-3.5" /> Skip
                        </button>
                        <button
                          onClick={() => updateStatus(stop.collection_id, 'closed')}
                          disabled={updating === stop.collection_id}
                          className="px-3 py-2 bg-gray-100 text-gray-700 text-xs font-semibold rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-1 disabled:opacity-50"
                        >
                          <DoorClosed className="w-3.5 h-3.5" /> Closed
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Depot End */}
              <div className="flex items-center gap-4 p-4 bg-teal-50">
                <div className="w-10 h-10 rounded-lg bg-[#52796f] flex items-center justify-center">
                  <Flag className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-bold text-teal-800">Waste Processing Center</p>
                  <p className="text-xs text-teal-600">Route end point</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Collection Summary */}
        {stops.length > 0 && (
          <div className="card rounded-xl p-6">
            <h3 className="font-bold text-stone-900 mb-4 flex items-center gap-2">
              <Truck className="w-5 h-5 text-[#2d6a4f]" />
              Collection Summary
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-2xl font-bold text-green-700">{collected}</p>
                <p className="text-xs text-stone-500">Successfully Collected</p>
              </div>
              <div className="text-center p-4 bg-amber-50 rounded-lg">
                <p className="text-2xl font-bold text-amber-700">{skipped}</p>
                <p className="text-xs text-stone-500">Skipped / Closed</p>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-700">{stops.length > 0 ? Math.round((collected / stops.length) * 100) : 0}%</p>
                <p className="text-xs text-stone-500">Success Rate</p>
              </div>
            </div>
          </div>
        )}

        {/* Quick Guide */}
        <div className="card rounded-xl p-6">
          <h3 className="font-bold text-stone-900 mb-3 flex items-center gap-2">
            <Navigation className="w-5 h-5 text-[#52796f]" />
            Driver Quick Guide
          </h3>
          <div className="grid sm:grid-cols-3 gap-3 text-sm">
            <div className="flex items-start gap-2 p-3 bg-green-50 rounded-lg">
              <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-green-800">Collected</p>
                <p className="text-green-600 text-xs">Garbage successfully picked up</p>
              </div>
            </div>
            <div className="flex items-start gap-2 p-3 bg-amber-50 rounded-lg">
              <SkipForward className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-amber-800">Skip</p>
                <p className="text-amber-600 text-xs">Household not accessible</p>
              </div>
            </div>
            <div className="flex items-start gap-2 p-3 bg-stone-50 rounded-lg">
              <DoorClosed className="w-4 h-4 text-stone-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-stone-800">Closed</p>
                <p className="text-stone-600 text-xs">Gate closed, no access</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
