const express = require('express');
const db = require('../database');
const { auth, requireRole } = require('../middleware/auth');

const router = express.Router();

// Dashboard stats
router.get('/stats', auth, requireRole('admin'), (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    const totalHouseholds = db.prepare('SELECT COUNT(*) as count FROM households').get().count;
    const reportingToday = db.prepare('SELECT COUNT(*) as count FROM garbage_reports WHERE date = ? AND available = 1').get(today).count;
    const collectedToday = db.prepare("SELECT COUNT(*) as count FROM collections WHERE date = ? AND status = 'collected'").get(today).count;
    const skippedToday = db.prepare("SELECT COUNT(*) as count FROM collections WHERE date = ? AND status = 'skipped'").get(today).count;
    const pendingToday = db.prepare("SELECT COUNT(*) as count FROM collections WHERE date = ? AND status = 'pending'").get(today).count;
    const totalDrivers = db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'driver'").get().count;
    const activeRoutes = db.prepare("SELECT COUNT(*) as count FROM routes WHERE date = ? AND status = 'active'").get(today).count;

    // Ward-wise stats
    const wardStats = db.prepare(`
      SELECT h.ward, COUNT(DISTINCT h.id) as total_houses,
             COUNT(DISTINCT CASE WHEN gr.available = 1 THEN gr.household_id END) as reporting
      FROM households h
      LEFT JOIN garbage_reports gr ON gr.household_id = h.id AND gr.date = ?
      GROUP BY h.ward
    `).all(today);

    // Weekly trend
    const weeklyTrend = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayData = db.prepare(`
        SELECT COUNT(CASE WHEN available = 1 THEN 1 END) as reported,
               (SELECT COUNT(*) FROM collections WHERE date = ? AND status = 'collected') as collected
        FROM garbage_reports WHERE date = ?
      `).get(dateStr, dateStr);
      weeklyTrend.push({ date: dateStr, ...dayData });
    }

    // Waste type distribution
    const wasteTypes = db.prepare(`
      SELECT waste_type, COUNT(*) as count FROM garbage_reports
      WHERE date >= date('now', '-7 days') AND available = 1
      GROUP BY waste_type
    `).all();

    // Collection efficiency
    const totalCollections = db.prepare("SELECT COUNT(*) as count FROM collections WHERE date >= date('now', '-7 days')").get().count;
    const successfulCollections = db.prepare("SELECT COUNT(*) as count FROM collections WHERE date >= date('now', '-7 days') AND status = 'collected'").get().count;
    const efficiency = totalCollections > 0 ? Math.round((successfulCollections / totalCollections) * 100) : 0;

    res.json({
      overview: { totalHouseholds, reportingToday, collectedToday, skippedToday, pendingToday, totalDrivers, activeRoutes, efficiency },
      wardStats,
      weeklyTrend,
      wasteTypes
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all households
router.get('/households', auth, requireRole('admin'), (req, res) => {
  try {
    const households = db.prepare(`
      SELECT h.*, u.name, u.phone FROM households h
      JOIN users u ON u.id = h.user_id
      ORDER BY h.ward, h.id
    `).all();
    res.json({ households });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all routes
router.get('/routes', auth, requireRole('admin'), (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const routes = db.prepare(`
      SELECT r.*, u.name as driver_name FROM routes r
      JOIN users u ON u.id = r.driver_id
      WHERE r.date = ?
    `).all(today);
    res.json({ routes });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all collections
router.get('/collections', auth, requireRole('admin'), (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const collections = db.prepare(`
      SELECT c.*, h.address, h.ward, u.name as resident_name
      FROM collections c
      JOIN households h ON h.id = c.household_id
      JOIN users u ON u.id = h.user_id
      WHERE c.date = ?
      ORDER BY c.status, h.ward
    `).all(today);
    res.json({ collections });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all drivers
router.get('/drivers', auth, requireRole('admin'), (req, res) => {
  try {
    const drivers = db.prepare("SELECT id, name, phone, created_at FROM users WHERE role = 'driver'").all();
    res.json({ drivers });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
