import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';
import Landing from './pages/Landing';
import Register from './pages/Register';
import NotFound from './pages/NotFound';

const ResidentLogin = lazy(() => import('./pages/login/ResidentLogin'));
const DriverLogin = lazy(() => import('./pages/login/DriverLogin'));
const AdminLogin = lazy(() => import('./pages/login/AdminLogin'));
const ResidentDashboard = lazy(() => import('./pages/resident/Dashboard'));
const ResidentCollections = lazy(() => import('./pages/resident/Collections'));
const ResidentHistory = lazy(() => import('./pages/resident/History'));
const ResidentStats = lazy(() => import('./pages/resident/Stats'));
const ResidentIncentives = lazy(() => import('./pages/resident/Incentives'));
const ResidentNotifications = lazy(() => import('./pages/resident/Notifications'));
const DriverDashboard = lazy(() => import('./pages/driver/Dashboard'));
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));
const AdminCollections = lazy(() => import('./pages/admin/Collections'));
const AdminHouseholds = lazy(() => import('./pages/admin/Households'));
const AdminDrivers = lazy(() => import('./pages/admin/Drivers'));

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-teal-50">
    <div className="text-center">
      <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto" />
      <p className="text-sm text-gray-500 mt-4">Loading...</p>
    </div>
  </div>
);

function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin" /></div>;
  if (!user) return <Navigate to="/login/resident" />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" />;
  return children;
}

function AppRoutes() {
  const { user } = useAuth();

  const getDashboard = () => {
    if (!user) return '/login/resident';
    if (user.role === 'resident') return '/resident';
    if (user.role === 'driver') return '/driver';
    if (user.role === 'admin') return '/admin';
    return '/login/resident';
  };

  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/" element={user ? <Navigate to={getDashboard()} /> : <Landing />} />
        <Route path="/login" element={user ? <Navigate to={getDashboard()} /> : <Navigate to="/login/resident" />} />
        <Route path="/login/resident" element={user ? <Navigate to={getDashboard()} /> : <ResidentLogin />} />
        <Route path="/login/driver" element={user ? <Navigate to={getDashboard()} /> : <DriverLogin />} />
        <Route path="/login/admin" element={user ? <Navigate to={getDashboard()} /> : <AdminLogin />} />
        <Route path="/register" element={user ? <Navigate to={getDashboard()} /> : <Register />} />
        <Route path="/resident" element={<ProtectedRoute roles={['resident']}><ResidentDashboard /></ProtectedRoute>} />
        <Route path="/resident/collections" element={<ProtectedRoute roles={['resident']}><ResidentCollections /></ProtectedRoute>} />
        <Route path="/resident/history" element={<ProtectedRoute roles={['resident']}><ResidentHistory /></ProtectedRoute>} />
        <Route path="/resident/stats" element={<ProtectedRoute roles={['resident']}><ResidentStats /></ProtectedRoute>} />
        <Route path="/resident/incentives" element={<ProtectedRoute roles={['resident']}><ResidentIncentives /></ProtectedRoute>} />
        <Route path="/resident/notifications" element={<ProtectedRoute roles={['resident']}><ResidentNotifications /></ProtectedRoute>} />
        <Route path="/driver" element={<ProtectedRoute roles={['driver']}><DriverDashboard /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/collections" element={<ProtectedRoute roles={['admin']}><AdminCollections /></ProtectedRoute>} />
        <Route path="/admin/households" element={<ProtectedRoute roles={['admin']}><AdminHouseholds /></ProtectedRoute>} />
        <Route path="/admin/drivers" element={<ProtectedRoute roles={['admin']}><AdminDrivers /></ProtectedRoute>} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <Router>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  );
}
