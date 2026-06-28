const express = require('express');
const { auth, requireRole } = require('../middleware/auth');
const { Household, GarbageReport, Collection, Route, User, ReportingWindow } = require('../models');

const router = express.Router();

// Dashboard stats
router.get('/stats', auth, requireRole('admin'), async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    // Run top-level counts in parallel
    const [totalHouseholds, reportingToday, collectedToday, skippedToday, pendingToday, totalDrivers, activeRoutes] = await Promise.all([
      Household.countDocuments(),
      GarbageReport.countDocuments({ date: today, available: true }),
      Collection.countDocuments({ date: today, status: 'collected' }),
      Collection.countDocuments({ date: today, status: 'skipped' }),
      Collection.countDocuments({ date: today, status: 'pending' }),
      User.countDocuments({ role: 'driver' }),
      Route.countDocuments({ date: today, status: 'active' })
    ]);

    // Ward-wise stats using aggregation
    const wardStats = await Household.aggregate([
      {
        $lookup: {
          from: 'garbagereports',
          let: { hid: '$id' },
          pipeline: [
            { $match: { $expr: { $and: [ { $eq: ['$household_id', '$$hid'] }, { $eq: ['$date', today] }, { $eq: ['$available', true] } ] } } },
            { $project: { household_id: 1 } }
          ],
          as: 'todayReports'
        }
      },
      {
        $group: {
          _id: '$ward',
          total_houses: { $sum: 1 },
          reporting: { $sum: { $cond: [ { $gt: [ { $size: '$todayReports' }, 0 ] }, 1, 0 ] } }
        }
      },
      { $project: { ward: '$_id', total_houses: 1, reporting: 1, _id: 0 } }
    ]);

    // Weekly trend (last 7 days) - aggregate counts to avoid many small DB calls
    const weeklyTrend = [];
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 6);
    const startStr = startDate.toISOString().split('T')[0];

    const [reportsAgg, collectionsAgg] = await Promise.all([
      GarbageReport.aggregate([
        { $match: { date: { $gte: startStr }, available: true } },
        { $group: { _id: '$date', reported: { $sum: 1 } } }
      ]),
      Collection.aggregate([
        { $match: { date: { $gte: startStr }, status: 'collected' } },
        { $group: { _id: '$date', collected: { $sum: 1 } } }
      ])
    ]);

    const reportsMap = Object.fromEntries(reportsAgg.map((r) => [r._id, r.reported]));
    const collectionsMap = Object.fromEntries(collectionsAgg.map((c) => [c._id, c.collected]));

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      weeklyTrend.push({ date: dateStr, reported: reportsMap[dateStr] || 0, collected: collectionsMap[dateStr] || 0 });
    }

    // Waste type distribution (last 7 days)
    const sevenAgo = new Date();
    sevenAgo.setDate(sevenAgo.getDate() - 7);
    const sevenAgoStr = sevenAgo.toISOString().split('T')[0];
    const wasteTypesAgg = await GarbageReport.aggregate([
      { $match: { date: { $gte: sevenAgoStr }, available: true } },
      { $group: { _id: '$waste_type', count: { $sum: 1 } } },
      { $project: { waste_type: '$_id', count: 1, _id: 0 } }
    ]);

    const totalCollections = await Collection.countDocuments({ date: { $gte: sevenAgoStr } });
    const successfulCollections = await Collection.countDocuments({ date: { $gte: sevenAgoStr }, status: 'collected' });
    const efficiency = totalCollections > 0 ? Math.round((successfulCollections / totalCollections) * 100) : 0;

    res.json({
      overview: { totalHouseholds, reportingToday, collectedToday, skippedToday, pendingToday, totalDrivers, activeRoutes, efficiency },
      wardStats,
      weeklyTrend,
      wasteTypes: wasteTypesAgg
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all households
router.get('/households', auth, requireRole('admin'), async (req, res) => {
  try {
    const households = await Household.aggregate([
      { $lookup: { from: 'users', localField: 'user_id', foreignField: 'id', as: 'user' } },
      { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
      { $project: { id: 1, user_id: 1, address: 1, latitude: 1, longitude: 1, num_residents: 1, ward: 1, created_at: 1, resident_name: '$user.name', resident_phone: '$user.phone' } },
      { $sort: { ward: 1, id: 1 } }
    ]);
    res.json({ households });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all routes
router.get('/routes', auth, requireRole('admin'), async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const routes = await Route.aggregate([
      { $match: { date: today } },
      { $lookup: { from: 'users', localField: 'driver_id', foreignField: 'id', as: 'driver' } },
      { $unwind: { path: '$driver', preserveNullAndEmptyArrays: true } },
      { $project: { id: 1, driver_id: 1, date: 1, ward: 1, stops: 1, total_distance: 1, estimated_time: 1, status: 1, driver_name: '$driver.name' } }
    ]);
    res.json({ routes });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all collections
router.get('/collections', auth, requireRole('admin'), async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const collections = await Collection.aggregate([
      { $match: { date: today } },
      { $lookup: { from: 'households', localField: 'household_id', foreignField: 'id', as: 'household' } },
      { $unwind: { path: '$household', preserveNullAndEmptyArrays: true } },
      { $lookup: { from: 'users', localField: 'household.user_id', foreignField: 'id', as: 'resident' } },
      { $unwind: { path: '$resident', preserveNullAndEmptyArrays: true } },
      { $project: { id: 1, household_id: 1, driver_id: 1, date: 1, status: 1, timestamp: 1, address: '$household.address', ward: '$household.ward', resident_name: '$resident.name' } },
      { $sort: { status: 1, ward: 1 } }
    ]);
    res.json({ collections });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all drivers
router.get('/drivers', auth, requireRole('admin'), async (req, res) => {
  try {
    const drivers = await User.find({ role: 'driver' }).select('id name phone created_at').lean();
    res.json({ drivers });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET reporting window status (admin)
router.get('/window-status', auth, requireRole('admin'), async (req, res) => {
  try {
    const win = await ReportingWindow.findOne({ id: 'singleton' }).lean();
    res.json({ is_open: win ? win.is_open : false, updated_at: win ? win.updated_at : null });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST toggle reporting window (admin)
router.post('/window-status', auth, requireRole('admin'), async (req, res) => {
  try {
    const { is_open } = req.body;
    if (typeof is_open !== 'boolean') {
      return res.status(400).json({ error: 'is_open must be a boolean.' });
    }
    const win = await ReportingWindow.findOneAndUpdate(
      { id: 'singleton' },
      { id: 'singleton', is_open, opened_by: req.user.id, updated_at: new Date() },
      { upsert: true, new: true }
    );
    res.json({ is_open: win.is_open, updated_at: win.updated_at });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
