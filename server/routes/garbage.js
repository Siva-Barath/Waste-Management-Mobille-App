const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../database');
const { auth, requireRole } = require('../middleware/auth');
const { createNotification } = require('./notifications');

const router = express.Router();

// Report garbage availability
router.post('/report', auth, requireRole('resident'), (req, res) => {
  try {
    const { available, wasteType = 'mixed' } = req.body;
    const household = db.prepare('SELECT * FROM households WHERE user_id = ?').get(req.user.id);
    if (!household) return res.status(404).json({ error: 'Household not found.' });

    const today = new Date().toISOString().split('T')[0];

    // Check if already reported today
    const existing = db.prepare('SELECT id FROM garbage_reports WHERE household_id = ? AND date = ?').get(household.id, today);
    if (existing) {
      db.prepare('UPDATE garbage_reports SET available = ?, waste_type = ?, timestamp = CURRENT_TIMESTAMP WHERE id = ?').run(available ? 1 : 0, wasteType, existing.id);
      createNotification(req.user.id, 'Your garbage report has been updated for today.', 'info');
      return res.json({ message: 'Report updated.', reportId: existing.id });
    }

    const id = uuidv4();
    db.prepare('INSERT INTO garbage_reports (id, household_id, date, available, waste_type) VALUES (?, ?, ?, ?, ?)').run(id, household.id, today, available ? 1 : 0, wasteType);

    // Award points for good segregation
    if (available && wasteType !== 'mixed') {
      db.prepare('INSERT INTO incentives (id, household_id, points, reason, date) VALUES (?, ?, ?, ?, ?)').run(uuidv4(), household.id, 5, `Proper ${wasteType} segregation`, today);
      createNotification(req.user.id, `Great job! You earned 5 bonus points for proper ${wasteType} waste segregation.`, 'info');
    }

    createNotification(req.user.id, available ? 'Your garbage report has been submitted. A driver will be assigned shortly.' : 'You reported no garbage for today. See you tomorrow!', 'reminder');

    // Notify all drivers about new garbage report
    if (available) {
      const drivers = db.prepare("SELECT id FROM users WHERE role = 'driver'").all();
      for (const driver of drivers) {
        createNotification(driver.id, `New pickup: ${household.address || 'A household'} reported ${wasteType} waste for collection.`, 'alert');
      }
    }

    res.status(201).json({ message: 'Garbage reported successfully.', reportId: id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get user's garbage history
router.get('/history', auth, requireRole('resident'), (req, res) => {
  try {
    const household = db.prepare('SELECT * FROM households WHERE user_id = ?').get(req.user.id);
    if (!household) return res.status(404).json({ error: 'Household not found.' });

    const reports = db.prepare(`
      SELECT gr.*, c.status as collection_status
      FROM garbage_reports gr
      LEFT JOIN collections c ON c.household_id = gr.household_id AND c.date = gr.date
      WHERE gr.household_id = ?
      ORDER BY gr.date DESC
      LIMIT 30
    `).all(household.id);

    res.json({ reports });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get today's report status
router.get('/today', auth, requireRole('resident'), (req, res) => {
  try {
    const household = db.prepare('SELECT * FROM households WHERE user_id = ?').get(req.user.id);
    if (!household) return res.status(404).json({ error: 'Household not found.' });

    const today = new Date().toISOString().split('T')[0];
    const report = db.prepare('SELECT * FROM garbage_reports WHERE household_id = ? AND date = ?').get(household.id, today);

    res.json({ reported: !!report, report });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get today's collection status (is the truck coming? route progress, driver info)
router.get('/collection-status', auth, requireRole('resident'), (req, res) => {
  try {
    const household = db.prepare('SELECT * FROM households WHERE user_id = ?').get(req.user.id);
    if (!household) return res.status(404).json({ error: 'Household not found.' });

    const today = new Date().toISOString().split('T')[0];

    // Today's report
    const todayReport = db.prepare('SELECT * FROM garbage_reports WHERE household_id = ? AND date = ?').get(household.id, today);

    // Today's collection entry
    const collection = db.prepare(`
      SELECT c.*, u.name as driver_name, u.phone as driver_phone
      FROM collections c
      LEFT JOIN users u ON u.id = c.driver_id
      WHERE c.household_id = ? AND c.date = ?
    `).get(household.id, today);

    // If there's a driver, get route progress
    let routeProgress = null;
    if (collection && collection.driver_id) {
      const route = db.prepare('SELECT * FROM routes WHERE driver_id = ? AND date = ?').get(collection.driver_id, today);
      if (route) {
        const stops = JSON.parse(route.stops);
        const totalStops = stops.length;
        // Count completed stops from collections
        const completedStops = db.prepare(`
          SELECT COUNT(*) as count FROM collections 
          WHERE driver_id = ? AND date = ? AND status IN ('collected','skipped','closed')
        `).get(collection.driver_id, today).count;
        const pendingStops = db.prepare(`
          SELECT COUNT(*) as count FROM collections 
          WHERE driver_id = ? AND date = ? AND status = 'pending'
        `).get(collection.driver_id, today).count;

        // Find position of this household in route
        const householdIndex = stops.indexOf(household.id);

        routeProgress = {
          totalStops,
          completedStops,
          pendingStops,
          householdPosition: householdIndex + 1,
          routeStatus: route.status,
          estimatedTime: route.estimated_time,
          totalDistance: route.total_distance
        };
      }
    }

    // Recent collections (last 7 days)
    const recentCollections = db.prepare(`
      SELECT c.date, c.status, u.name as driver_name
      FROM collections c
      LEFT JOIN users u ON u.id = c.driver_id
      WHERE c.household_id = ?
      ORDER BY c.date DESC LIMIT 7
    `).all(household.id);

    res.json({
      reported: !!todayReport,
      todayReport,
      collection,
      routeProgress,
      recentCollections
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get resident personal statistics
router.get('/my-stats', auth, requireRole('resident'), (req, res) => {
  try {
    const household = db.prepare('SELECT * FROM households WHERE user_id = ?').get(req.user.id);
    if (!household) return res.status(404).json({ error: 'Household not found.' });

    // Weekly reporting trend (last 14 days)
    const weeklyTrend = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const report = db.prepare('SELECT available, waste_type FROM garbage_reports WHERE household_id = ? AND date = ?').get(household.id, dateStr);
      const collection = db.prepare('SELECT status FROM collections WHERE household_id = ? AND date = ?').get(household.id, dateStr);
      weeklyTrend.push({
        date: dateStr,
        reported: report ? (report.available ? 1 : 0) : 0,
        collected: collection && collection.status === 'collected' ? 1 : 0,
        wasteType: report?.waste_type || null
      });
    }

    // Waste type distribution (last 30 days)
    const wasteTypes = db.prepare(`
      SELECT waste_type, COUNT(*) as count 
      FROM garbage_reports 
      WHERE household_id = ? AND available = 1 AND date >= date('now', '-30 days')
      GROUP BY waste_type
    `).all(household.id);

    // Collection stats (all time)
    const totalReports = db.prepare('SELECT COUNT(*) as count FROM garbage_reports WHERE household_id = ?').get(household.id).count;
    const totalGarbageDays = db.prepare('SELECT COUNT(*) as count FROM garbage_reports WHERE household_id = ? AND available = 1').get(household.id).count;
    const totalCollected = db.prepare("SELECT COUNT(*) as count FROM collections WHERE household_id = ? AND status = 'collected'").get(household.id).count;
    const totalSkipped = db.prepare("SELECT COUNT(*) as count FROM collections WHERE household_id = ? AND status IN ('skipped','closed')").get(household.id).count;
    const totalPoints = db.prepare('SELECT COALESCE(SUM(points),0) as total FROM incentives WHERE household_id = ?').get(household.id).total;

    // Segregation score (non-mixed vs total)
    const segregated = db.prepare("SELECT COUNT(*) as count FROM garbage_reports WHERE household_id = ? AND available = 1 AND waste_type != 'mixed'").get(household.id).count;
    const segregationScore = totalGarbageDays > 0 ? Math.round((segregated / totalGarbageDays) * 100) : 0;

    // Collection success rate
    const collectionRate = totalGarbageDays > 0 ? Math.round((totalCollected / totalGarbageDays) * 100) : 0;

    res.json({
      weeklyTrend,
      wasteTypes,
      overview: {
        totalReports,
        totalGarbageDays,
        totalCollected,
        totalSkipped,
        totalPoints,
        segregationScore,
        collectionRate
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get incentive points
router.get('/incentives', auth, requireRole('resident'), (req, res) => {
  try {
    const household = db.prepare('SELECT * FROM households WHERE user_id = ?').get(req.user.id);
    if (!household) return res.status(404).json({ error: 'Household not found.' });

    const incentives = db.prepare('SELECT * FROM incentives WHERE household_id = ? ORDER BY date DESC LIMIT 30').all(household.id);
    const totalPoints = db.prepare('SELECT SUM(points) as total FROM incentives WHERE household_id = ?').get(household.id);

    res.json({ incentives, totalPoints: totalPoints.total || 0 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
