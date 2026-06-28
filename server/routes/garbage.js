const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { auth, requireRole } = require('../middleware/auth');
const { createNotification } = require('./notifications');
const { GarbageReport, Household, Collection, User, Incentive, Route, ReportingWindow } = require('../models');

const router = express.Router();

// Public: get reporting window status — no auth required so the login screen can show it too
router.get('/window-status', async (req, res) => {
  try {
    const win = await ReportingWindow.findOne({ id: 'singleton' }).lean();
    res.json({ window_open: win ? win.is_open : false, updated_at: win ? win.updated_at : null });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Report garbage availability
router.post('/report', auth, requireRole('resident'), async (req, res) => {
  try {
    const { available, wasteType = 'mixed' } = req.body;
    const household = await Household.findOne({ user_id: req.user.id }).lean();
    if (!household) return res.status(404).json({ error: 'Household not found.' });

    const today = new Date().toISOString().split('T')[0];

    // Check if already reported today and update in one operation
    const updated = await GarbageReport.findOneAndUpdate(
      { household_id: household.id, date: today },
      { $set: { available: !!available, waste_type: wasteType, timestamp: new Date() } },
      { new: true }
    );
    if (updated) {
      // create resident notification and include it in the response so the
      // client can update UI immediately. Driver notifications remain
      // fire-and-forget to avoid slowing the response.
      let residentNotifId = null;
      try {
        residentNotifId = await createNotification(req.user.id, 'Your garbage report has been updated for today.', 'info');
      } catch (e) {
        // swallow — don't fail reporting if notification write fails
      }
      return res.json({ message: 'Report updated.', reportId: updated.id, notificationId: residentNotifId });
    }

    const id = uuidv4();
    await GarbageReport.create({ id, household_id: household.id, date: today, available: !!available, waste_type: wasteType });

    // Award points for good segregation (do writes in background to keep response snappy)
    if (available && wasteType !== 'mixed') {
      Incentive.create({ id: uuidv4(), household_id: household.id, points: 5, reason: `Proper ${wasteType} segregation`, date: today }).catch(() => {});
      // award notification (background)
      createNotification(req.user.id, `Great job! You earned 5 bonus points for proper ${wasteType} waste segregation.`, 'info').catch(() => {});
    }

    // Create resident notification and await it so client can show it immediately
    let residentNotifId = null;
    try {
      residentNotifId = await createNotification(req.user.id, available ? 'Your garbage report has been submitted. A driver will be assigned shortly.' : 'You reported no garbage for today. See you tomorrow!', 'reminder');
    } catch (e) {
      // ignore
    }

    // Notify all drivers about new garbage report
    if (available) {
      const drivers = await User.find({ role: 'driver' }).select('id').lean();
      // fire-and-forget notifications to drivers so reporting response isn't blocked
      if (drivers && drivers.length) {
        drivers.forEach((driver) => {
          createNotification(driver.id, `New pickup: ${household.address || 'A household'} reported ${wasteType} waste for collection.`, 'alert').catch(() => {});
        });
      }
    }

    // Return resident notification id to help the mobile client update state
    res.status(201).json({ message: 'Garbage reported successfully.', reportId: id, notificationId: residentNotifId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get user's garbage history
router.get('/history', auth, requireRole('resident'), async (req, res) => {
  try {
    const household = await Household.findOne({ user_id: req.user.id }).lean();
    if (!household) return res.status(404).json({ error: 'Household not found.' });

    const reports = await GarbageReport.aggregate([
      { $match: { household_id: household.id } },
      { $lookup: { from: 'collections', let: { hid: '$household_id', date: '$date' }, pipeline: [ { $match: { $expr: { $and: [ { $eq: ['$household_id', '$$hid'] }, { $eq: ['$date', '$$date'] } ] } } }, { $project: { status: 1 } } ], as: 'collection' } },
      { $unwind: { path: '$collection', preserveNullAndEmptyArrays: true } },
      { $project: { id: 1, household_id: 1, date: 1, available: 1, waste_type: 1, timestamp: 1, collection_status: '$collection.status' } },
      { $sort: { date: -1 } },
      { $limit: 30 }
    ]);

    res.json({ reports });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get today's report status
router.get('/today', auth, requireRole('resident'), async (req, res) => {
  try {
    const household = await Household.findOne({ user_id: req.user.id }).lean();
    if (!household) return res.status(404).json({ error: 'Household not found.' });

    const today = new Date().toISOString().split('T')[0];
    const report = await GarbageReport.findOne({ household_id: household.id, date: today }).lean();

    res.json({ reported: !!report, report });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get today's collection status (is the truck coming? route progress, driver info)
router.get('/collection-status', auth, requireRole('resident'), async (req, res) => {
  try {
    const household = await Household.findOne({ user_id: req.user.id }).lean();
    if (!household) return res.status(404).json({ error: 'Household not found.' });

    const today = new Date().toISOString().split('T')[0];

    // Today's report
    const todayReport = await GarbageReport.findOne({ household_id: household.id, date: today }).lean();

    // Today's collection entry
    const collAgg = await Collection.aggregate([
      { $match: { household_id: household.id, date: today } },
      { $lookup: { from: 'users', localField: 'driver_id', foreignField: 'id', as: 'driver' } },
      { $unwind: { path: '$driver', preserveNullAndEmptyArrays: true } },
      { $project: { id: 1, household_id: 1, driver_id: 1, date: 1, status: 1, timestamp: 1, driver_name: '$driver.name', driver_phone: '$driver.phone' } }
    ]);
    const collection = collAgg.length ? collAgg[0] : null;

    // If there's a driver, get route progress
    let routeProgress = null;
    if (collection && collection.driver_id) {
      const route = await Route.findOne({ driver_id: collection.driver_id, date: today }).lean();
      if (route) {
          const stops = Array.isArray(route.stops) ? route.stops : (route.stops ? JSON.parse(route.stops) : []);
          const totalStops = stops.length;
          // Count completed & pending stops in parallel
          const [completedStops, pendingStops] = await Promise.all([
            Collection.countDocuments({ driver_id: collection.driver_id, date: today, status: { $in: ['collected', 'skipped', 'closed'] } }),
            Collection.countDocuments({ driver_id: collection.driver_id, date: today, status: 'pending' })
          ]);

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
    const recentCollections = await Collection.aggregate([
      { $match: { household_id: household.id } },
      { $lookup: { from: 'users', localField: 'driver_id', foreignField: 'id', as: 'driver' } },
      { $unwind: { path: '$driver', preserveNullAndEmptyArrays: true } },
      { $project: { date: 1, status: 1, driver_name: '$driver.name' } },
      { $sort: { date: -1 } },
      { $limit: 7 }
    ]);

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
router.get('/my-stats', auth, requireRole('resident'), async (req, res) => {
  try {
    const household = await Household.findOne({ user_id: req.user.id }).lean();
    if (!household) return res.status(404).json({ error: 'Household not found.' });

    // Weekly reporting trend (last 14 days) - fetch in ranges and build in-memory map to avoid many small DB queries
    const weeklyTrend = [];
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 13);
    const startStr = startDate.toISOString().split('T')[0];

    // Fetch recent reports and collections in one go (within the date range)
    const [reportsList, collectionsList] = await Promise.all([
      GarbageReport.find({ household_id: household.id, date: { $gte: startStr } }).lean(),
      Collection.find({ household_id: household.id, date: { $gte: startStr } }).lean()
    ]);

    const reportsMap = {};
    for (const r of reportsList) {
      reportsMap[r.date] = { reported: r.available ? 1 : 0, wasteType: r.waste_type || null };
    }

    const collectionsMap = {};
    for (const c of collectionsList) {
      collectionsMap[c.date] = collectionsMap[c.date] || 0;
      if (c.status === 'collected') collectionsMap[c.date] += 1;
    }

    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      weeklyTrend.push({
        date: dateStr,
        reported: reportsMap[dateStr] ? reportsMap[dateStr].reported : 0,
        collected: collectionsMap[dateStr] || 0,
        wasteType: reportsMap[dateStr] ? reportsMap[dateStr].wasteType : null
      });
    }

    // Waste type distribution (last 30 days)
    const thirtyAgo = new Date();
    thirtyAgo.setDate(thirtyAgo.getDate() - 30);
    const thirtyAgoStr = thirtyAgo.toISOString().split('T')[0];
    const wasteTypes = await GarbageReport.aggregate([
      { $match: { household_id: household.id, available: true, date: { $gte: thirtyAgoStr } } },
      { $group: { _id: '$waste_type', count: { $sum: 1 } } },
      { $project: { waste_type: '$_id', count: 1, _id: 0 } }
    ]);

    // Collection stats (all time) - run counts in parallel
    const [totalReports, totalGarbageDays, totalCollected, totalSkipped, pointsAgg] = await Promise.all([
      GarbageReport.countDocuments({ household_id: household.id }),
      GarbageReport.countDocuments({ household_id: household.id, available: true }),
      Collection.countDocuments({ household_id: household.id, status: 'collected' }),
      Collection.countDocuments({ household_id: household.id, status: { $in: ['skipped', 'closed'] } }),
      Incentive.aggregate([{ $match: { household_id: household.id } }, { $group: { _id: null, total: { $sum: '$points' } } }])
    ]);
    const totalPoints = pointsAgg.length ? pointsAgg[0].total : 0;

    // Segregation score (non-mixed vs total)
    const segregated = await GarbageReport.countDocuments({ household_id: household.id, available: true, waste_type: { $ne: 'mixed' } });
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
router.get('/incentives', auth, requireRole('resident'), async (req, res) => {
  try {
    const household = await Household.findOne({ user_id: req.user.id }).lean();
    if (!household) return res.status(404).json({ error: 'Household not found.' });

    const incentives = await Incentive.find({ household_id: household.id }).sort({ date: -1 }).limit(30).lean();
    const totalAgg = await Incentive.aggregate([{ $match: { household_id: household.id } }, { $group: { _id: null, total: { $sum: '$points' } } }]);
    const totalPoints = totalAgg.length ? totalAgg[0].total : 0;

    res.json({ incentives, totalPoints });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Ward leaderboard ranked by green points
router.get('/ward-leaderboard', auth, requireRole('resident'), async (req, res) => {
  try {
    const household = await Household.findOne({ user_id: req.user.id }).lean();
    if (!household) return res.status(404).json({ error: 'Household not found.' });

    const ward = household.ward;
    const householdsInWard = await Household.find({ ward }).lean();
    const householdIds = householdsInWard.map((h) => h.id);

    const pointsAgg = await Incentive.aggregate([
      { $match: { household_id: { $in: householdIds } } },
      { $group: { _id: '$household_id', totalPoints: { $sum: '$points' } } },
    ]);

    const pointsMap = Object.fromEntries(pointsAgg.map((p) => [p._id, p.totalPoints]));
    const users = await User.find({ id: { $in: householdsInWard.map((h) => h.user_id) } }).lean();
    const userMap = Object.fromEntries(users.map((u) => [u.id, u]));

    const leaderboard = householdsInWard
      .map((h) => ({
        householdId: h.id,
        userId: h.user_id,
        name: userMap[h.user_id]?.name || 'Resident',
        points: pointsMap[h.id] || 0,
        isCurrentUser: h.user_id === req.user.id,
      }))
      .sort((a, b) => b.points - a.points || a.name.localeCompare(b.name))
      .map((entry, index) => ({ ...entry, rank: index + 1 }));

    const currentUserRank = leaderboard.find((e) => e.isCurrentUser)?.rank ?? null;

    res.json({ ward, leaderboard, currentUserRank });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
