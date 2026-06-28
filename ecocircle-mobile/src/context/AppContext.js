import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AppState } from 'react-native';
import { useAuth } from './AuthContext';
import api from '../services/api';

const AppContext = createContext(null);

/**
 * AppProvider - App-level state management
 * 
 * Manages app-wide state:
 * - Notifications and notification count
 * - General resident shared state (Home, Track, Activity, Profile)
 * - Efficient polling & background pause
 */

export function AppProvider({ children }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [notificationCount, setNotificationCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Unified Shared Resident State
  const [residentState, setResidentState] = useState({
    windowOpen: false,
    reported: false,
    status: 'not_reported', // 'not_reported' | 'reported' | 'scheduled' | 'assigned' | 'en_route' | 'collected'
    reports: [],
    stats: {
      total: 0,
      collected: 0,
      points: 0,
      rank: '—',
      ecoScore: 82
    },
    leaderboard: [],
    assignedTruck: null,
    truckPos: null,
    eta: '—',
    collection: null
  });

  /**
   * Fetch resident state from Flask backend
   */
  const fetchResidentData = useCallback(async () => {
    if (!user?.house_id) return;
    try {
      // 1. Fetch simulation status
      const simRes = await api.get('/get_simulation_status');
      const sim = simRes.data?.simulation || {};
      const simHouses = sim.houses || [];
      const myHouse = simHouses.find(h => h.id === user.house_id);

      // 2. Fetch resident reports history safely
      let reports = [];
      try {
        const historyRes = await api.get('/get_collection_history');
        const records = historyRes.data?.records || [];
        const myRecords = records.filter(r => r.location_id === user.house_id);
        
        reports = myRecords.map(r => {
          const d = new Date(r.collected_at * 1000);
          return {
            date: d.toISOString().split('T')[0],
            waste_type: 'mixed',
            collection_status: 'collected',
          };
        });
      } catch (err) {
        console.warn('History fetch in AppContext failed:', err);
      }

      // 3. Fetch resident profile for backend ETA (failsafe)
      let profile = {};
      try {
        const profileRes = await api.get(`/resident/profile/${user.house_id}`);
        profile = profileRes.data || {};
      } catch {
        /* ignore profile fetch errors */
      }

      const totalReports = reports.length;
      const totalCollected = reports.filter(r => r.collection_status === 'collected').length;
      const points = totalCollected * 5;

      // Compute stable leaderboard
      const leaderboardList = [];
      for (let i = 1; i <= 45; i++) {
        const hid = `H${i}`;
        const basePts = 35 + (i * 17) % 180;
        const simH = simHouses.find(h => h.id === hid);
        let pts = basePts;
        if (simH?.status === 'collected') pts += 10;
        if (hid === user.house_id) {
          pts = points;
        }
        leaderboardList.push({ houseId: hid, points: pts });
      }
      leaderboardList.sort((a, b) => b.points - a.points);
      const rankedLeaderboard = leaderboardList.map((item, index) => ({
        rank: index + 1,
        householdId: item.houseId,
        points: item.points,
        isCurrentUser: item.houseId === user.house_id
      }));

      const myRankItem = rankedLeaderboard.find(e => e.isCurrentUser);
      const rank = myRankItem ? `#${myRankItem.rank}` : '—';
      const ecoScore = totalReports > 0 ? Math.round((totalCollected / totalReports) * 100) : 85;

      // Find assigned truck
      const assignedRoute = sim.multi_truck_routes?.find(r => r.route?.some(w => w.id === user.house_id));
      const truckId = assignedRoute?.truck_id;

      const isMyHouseCollected = myHouse?.collected === true || 
                                 sim.collected_houses?.includes(user.house_id) || 
                                 myHouse?.status === 'collected';

      const hasReportedToday = myHouse?.has_garbage === true || 
                               myHouse?.status === 'reported' || 
                               myHouse?.status === 'admin_marked' ||
                               isMyHouseCollected;

      let status = 'not_reported';
      let assignedTruck = null;
      let collection = null;
      let eta = '—';
      let truckPos = null;

      if (hasReportedToday) {
        status = 'reported';
        if (sim.route_optimized) {
          status = 'scheduled';
        }
        if (truckId) {
          status = 'assigned';
          assignedTruck = truckId;
          const truck_pos = sim.truck_positions?.[truckId] || null;
          const truck_state = sim.truck_states?.[truckId] || null;
          truckPos = truck_pos;
          
          const stops = assignedRoute.route || [];
          const housesCollected = stops
            .filter(s => s.type === 'garbage' && (sim.collected_houses?.includes(s.id) || simHouses.find(h => h.id === s.id)?.collected === true))
            .map(s => s.id);
          
          collection = {
            status: isMyHouseCollected ? 'collected' : (myHouse?.status || 'reported'),
            driver_name: `${truckId} Driver`,
            driver_id: truckId,
            current_stop: housesCollected.length > 0 ? housesCollected[housesCollected.length - 1] : 'Depot',
            next_stop: stops.find(s => s.type === 'garbage' && !housesCollected.includes(s.id))?.id || 'Processing Center',
            completed: truck_state?.completed || false
          };

          // Use ETA directly from the backend
          eta = profile.eta?.eta_text || '—';

          if (sim.truck_spawned) {
            if (isMyHouseCollected) {
              status = 'collected';
              collection.status = 'collected';
            } else {
              const uncollectedStops = stops.filter(s => s.type === 'garbage' && !housesCollected.includes(s.id));
              if (uncollectedStops[0]?.id === user.house_id) {
                status = 'en_route';
                collection.status = 'en_route';
              } else {
                status = 'en_route';
                collection.status = 'en_route';
              }
            }
          }
        }
      }

      setResidentState({
        windowOpen: sim.reporting_active === true,
        reported: status !== 'not_reported',
        status,
        reports,
        stats: {
          total: totalReports,
          collected: totalCollected,
          points,
          rank,
          ecoScore
        },
        leaderboard: rankedLeaderboard,
        assignedTruck,
        truckPos,
        eta,
        collection
      });
    } catch (err) {
      // Clear simulation fields on polling failure
      setResidentState({
        windowOpen: false,
        reported: false,
        status: 'not_reported',
        reports: [],
        stats: {
          total: 0,
          collected: 0,
          points: 0,
          rank: '—',
          ecoScore: 82
        },
        leaderboard: [],
        assignedTruck: null,
        truckPos: null,
        eta: '—',
        collection: null
      });
    }
  }, [user]);

  /**
   * Fetch notifications from API
   */
  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    try {
      const res = await api.get('/resident/notifications');
      const notifs = res.data.notifications || [];
      setNotifications(notifs);
      setNotificationCount(notifs.filter(n => !n.read).length);
    } catch {
      // endpoint not available — silently ignore
    }
  }, [user]);

  /**
   * Start polling notifications and resident status on mount/when user changes
   */
  useEffect(() => {
    if (!user) {
      setNotifications([]);
      setNotificationCount(0);
      setResidentState({
        windowOpen: false,
        reported: false,
        status: 'not_reported',
        reports: [],
        stats: { total: 0, collected: 0, points: 0, rank: '—', ecoScore: 82 },
        leaderboard: [],
        assignedTruck: null,
        truckPos: null,
        eta: '—',
        collection: null
      });
      return;
    }

    // Fetch immediately
    fetchNotifications();
    fetchResidentData();

    // Poll every 3 seconds for live synchronized state updates
    let interval = setInterval(() => {
      fetchNotifications();
      fetchResidentData();
    }, 3000);

    // Pause polling when app goes to background
    const sub = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') {
        fetchNotifications();
        fetchResidentData();
        clearInterval(interval);
        interval = setInterval(() => {
          fetchNotifications();
          fetchResidentData();
        }, 3000);
      } else {
        clearInterval(interval);
      }
    });

    return () => {
      clearInterval(interval);
      sub.remove();
    };
  }, [user, fetchNotifications, fetchResidentData]);

  /**
   * Mark notification as read
   */
  const markAsRead = async (notificationId) => {
    try {
      await api.put(`/notifications/${notificationId}/read`);
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
      setNotificationCount(prev => Math.max(0, prev - 1));
    } catch {
      /* ignore */
    }
  };

  const clearNotifications = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setNotificationCount(0);
    } catch {
      /* ignore */
    }
  };

  /**
   * Show error toast/alert
   */
  const showError = (message) => {
    setError(message);
    setTimeout(() => setError(null), 5000);
  };

  /**
   * Clear error
   */
  const clearError = () => {
    setError(null);
  };

  const value = {
    notifications,
    notificationCount,
    loading,
    error,
    residentState,
    setLoading,
    showError,
    clearError,
    fetchNotifications,
    fetchResidentData,
    markAsRead,
    clearNotifications,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

/**
 * useApp Hook - Access app context
 */
export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}
