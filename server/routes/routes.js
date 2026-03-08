const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../database');
const { auth, requireRole } = require('../middleware/auth');
const { createNotification } = require('./notifications');

const router = express.Router();

// Get today's optimized route for driver
router.get('/today', auth, requireRole('driver'), (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    let route = db.prepare('SELECT * FROM routes WHERE driver_id = ? AND date = ?').get(req.user.id, today);

    if (!route) {
      // Build a route from today's garbage reports
      const availableHouses = db.prepare(`
        SELECT h.*, gr.waste_type FROM households h
        JOIN garbage_reports gr ON gr.household_id = h.id
        WHERE gr.date = ? AND gr.available = 1
        ORDER BY h.ward, h.latitude
      `).all(today);

      if (availableHouses.length === 0) {
        return res.json({ route: null, stops: [], message: 'No houses reporting garbage today.' });
      }

      // Simple greedy nearest-neighbor route optimization
      const stops = optimizeRoute(availableHouses);
      const routeId = uuidv4();
      const totalDist = calculateTotalDistance(stops);

      db.prepare('INSERT INTO routes (id, driver_id, date, ward, stops, total_distance, estimated_time) VALUES (?, ?, ?, ?, ?, ?, ?)').run(
        routeId, req.user.id, today, 'All', JSON.stringify(stops.map(s => s.id)), totalDist, totalDist * 3
      );

      // Create pending collections
      for (const stop of stops) {
        const existingCol = db.prepare('SELECT id FROM collections WHERE household_id = ? AND date = ?').get(stop.id, today);
        if (!existingCol) {
          db.prepare('INSERT INTO collections (id, household_id, driver_id, date, status) VALUES (?, ?, ?, ?, ?)').run(uuidv4(), stop.id, req.user.id, today, 'pending');
        }
      }

      route = db.prepare('SELECT * FROM routes WHERE id = ?').get(routeId);
      createNotification(req.user.id, `New route assigned with ${stops.length} stops. Estimated distance: ${totalDist.toFixed(1)} km.`, 'reminder');
    }

    // Get stop details
    const stopIds = JSON.parse(route.stops);
    const stops = stopIds.map(sid => {
      const h = db.prepare(`
        SELECT h.*, u.name as resident_name, u.phone as resident_phone,
               c.status as collection_status, c.id as collection_id
        FROM households h
        JOIN users u ON u.id = h.user_id
        LEFT JOIN collections c ON c.household_id = h.id AND c.date = ?
        WHERE h.id = ?
      `).get(new Date().toISOString().split('T')[0], sid);
      return h;
    }).filter(Boolean);

    res.json({ route, stops });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update collection status
router.put('/collect/:collectionId', auth, requireRole('driver'), (req, res) => {
  try {
    const { status } = req.body;
    if (!['collected', 'skipped', 'closed'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status.' });
    }

    db.prepare('UPDATE collections SET status = ?, timestamp = CURRENT_TIMESTAMP WHERE id = ?').run(status, req.params.collectionId);

    // Get the household and resident for this collection
    const collection = db.prepare(`
      SELECT c.household_id, h.user_id, h.address FROM collections c
      JOIN households h ON h.id = c.household_id
      WHERE c.id = ?
    `).get(req.params.collectionId);

    if (collection) {
      // Notify the resident about collection status
      if (status === 'collected') {
        createNotification(collection.user_id, 'Your garbage has been collected! You earned 2 reward points.', 'info');
        db.prepare('INSERT INTO incentives (id, household_id, points, reason, date) VALUES (?, ?, ?, ?, ?)').run(
          uuidv4(), collection.household_id, 2, 'Garbage collected on time', new Date().toISOString().split('T')[0]
        );
      } else if (status === 'skipped') {
        createNotification(collection.user_id, 'Collection was skipped at your address today. Please ensure garbage is accessible.', 'alert');
      } else if (status === 'closed') {
        createNotification(collection.user_id, 'Collection marked as closed for your address today.', 'reminder');
      }
    }

    res.json({ message: 'Collection status updated.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Complete route
router.put('/complete/:routeId', auth, requireRole('driver'), (req, res) => {
  try {
    db.prepare('UPDATE routes SET status = ? WHERE id = ? AND driver_id = ?').run('completed', req.params.routeId, req.user.id);
    createNotification(req.user.id, 'Route completed successfully! Great work today.', 'info');
    res.json({ message: 'Route completed.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Route optimization - nearest neighbor heuristic
function optimizeRoute(houses) {
  if (houses.length <= 1) return houses;
  const visited = [houses[0]];
  const remaining = houses.slice(1);

  while (remaining.length > 0) {
    const last = visited[visited.length - 1];
    let nearest = 0;
    let minDist = Infinity;
    for (let i = 0; i < remaining.length; i++) {
      const d = haversine(last.latitude, last.longitude, remaining[i].latitude, remaining[i].longitude);
      if (d < minDist) { minDist = d; nearest = i; }
    }
    visited.push(remaining.splice(nearest, 1)[0]);
  }
  return visited;
}

function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const toRad = deg => deg * Math.PI / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function calculateTotalDistance(stops) {
  let total = 0;
  for (let i = 1; i < stops.length; i++) {
    total += haversine(stops[i - 1].latitude, stops[i - 1].longitude, stops[i].latitude, stops[i].longitude);
  }
  return Math.round(total * 100) / 100;
}

module.exports = router;
