import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import api from '../../api';
import { BarChart3, Home as HomeIcon, ClipboardList, Users, Truck, MapPin, Phone, CheckCircle, Clock, Map } from 'lucide-react';

const navItems = [
  { to: '/admin', label: 'Dashboard', icon: <BarChart3 className="w-4 h-4" />, end: true },
  { to: '/admin/collections', label: 'Collections', icon: <ClipboardList className="w-4 h-4" /> },
  { to: '/admin/households', label: 'Households', icon: <HomeIcon className="w-4 h-4" /> },
  { to: '/admin/drivers', label: 'Drivers', icon: <Truck className="w-4 h-4" /> },
];

export default function AdminDrivers() {
  const [drivers, setDrivers] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/admin/drivers'),
      api.get('/admin/routes'),
    ]).then(([driversRes, routesRes]) => {
      setDrivers(driversRes.data.drivers || []);
      setRoutes(routesRes.data.routes || []);
    }).finally(() => setLoading(false));
  }, []);

  const getDriverRoute = (driverId) => routes.find(r => r.driver_id === driverId);

  return (
    <Layout navItems={navItems}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-stone-900">Drivers & Routes</h1>
          <p className="text-stone-500 mt-1">{drivers.length} registered drivers</p>
        </div>

        {/* Driver Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="card rounded-xl p-5 text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-lg bg-blue-100 flex items-center justify-center">
              <Truck className="w-6 h-6 text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-stone-900">{drivers.length}</p>
            <p className="text-xs text-stone-500">Total Drivers</p>
          </div>
          <div className="card rounded-xl p-5 text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-lg bg-[#d8f3dc] flex items-center justify-center">
              <Map className="w-6 h-6 text-[#2d6a4f]" />
            </div>
            <p className="text-2xl font-bold text-[#2d6a4f]">{routes.filter(r => r.status === 'active').length}</p>
            <p className="text-xs text-stone-500">Active Routes</p>
          </div>
          <div className="card rounded-xl p-5 text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-lg bg-teal-100 flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-teal-600" />
            </div>
            <p className="text-2xl font-bold text-teal-600">{routes.filter(r => r.status === 'completed').length}</p>
            <p className="text-xs text-stone-500">Completed Today</p>
          </div>
        </div>

        {/* Driver Cards */}
        {loading ? (
          <div className="p-12 text-center">
            <div className="w-8 h-8 border-3 border-[#2d6a4f] border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {drivers.map((driver, i) => {
              const route = getDriverRoute(driver.id);
              return (
                <div key={i} className="card rounded-xl p-5">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full bg-[#2d6a4f] flex items-center justify-center text-white font-bold text-lg">
                      {driver.name?.charAt(0)?.toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-bold text-stone-900">{driver.name}</h3>
                      <div className="flex items-center gap-1 text-sm text-stone-500">
                        <Phone className="w-3 h-3" />
                        {driver.phone}
                      </div>
                    </div>
                  </div>

                  {route ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-stone-500">Route Status</span>
                        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                          route.status === 'active' ? 'bg-[#d8f3dc] text-[#2d6a4f]' :
                          route.status === 'completed' ? 'bg-teal-100 text-teal-700' :
                          'bg-stone-100 text-stone-700'
                        }`}>
                          {route.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="flex items-center gap-1 text-stone-600">
                          <MapPin className="w-3.5 h-3.5" />
                          {route.total_stops || 0} stops
                        </span>
                        <span className="flex items-center gap-1 text-stone-600">
                          <Truck className="w-3.5 h-3.5" />
                          {route.total_distance} km
                        </span>
                        <span className="flex items-center gap-1 text-stone-600">
                          <Clock className="w-3.5 h-3.5" />
                          {route.estimated_time} min
                        </span>
                      </div>
                      <div className="w-full h-2 bg-stone-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#2d6a4f] rounded-full"
                          style={{ width: `${route.status === 'completed' ? 100 : Math.min(50, 100)}%` }}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-stone-400 flex items-center gap-2 p-3 bg-stone-50 rounded-lg">
                      <Clock className="w-4 h-4" />
                      No route assigned today
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {!loading && drivers.length === 0 && (
          <div className="text-center p-12 text-stone-500">
            <Truck className="w-12 h-12 mx-auto mb-3 text-stone-300" />
            <p>No drivers registered yet</p>
          </div>
        )}
      </div>
    </Layout>
  );
}
