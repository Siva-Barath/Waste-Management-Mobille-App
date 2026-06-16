const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { auth, requireRole } = require('../middleware/auth');
const { createNotification } = require('./notifications');
const { Route, Household, GarbageReport, Collection, User, Incentive } = require('../models');

const router = express.Router();

// Get today's optimized route for driver
router.get('/today', auth, requireRole('driver'), async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    let route = await Route.findOne({ driver_id: req.user.id, date: today }).lean();

    if (!route) {
      // Build a route from today's garbage reports
      const availableHouses = await Household.aggregate([
        { $lookup: { from: 'garbagereports', let: { hid: '$id' }, pipeline: [ { $match: { $expr: { $and: [ { $eq: ['$household_id', '$$hid'] }, { $eq: ['$date', today] }, { $eq: ['$available', true] } ] } } }, { $project: { waste_type: 1 } } ], as: 'gr' } },
        { $match: { 'gr.0': { $exists: true } } },
        { $project: { id: 1, address: 1, ward: 1, latitude: 1, longitude: 1, waste_type: { $arrayElemAt: ['$gr.waste_type', 0] } } },
        { $sort: { ward: 1, latitude: 1 } }
      ]);

      if (availableHouses.length === 0) {
        return res.json({ route: null, stops: [], message: 'No houses reporting garbage today.' });
      }

      // Simple greedy nearest-neighbor route optimization
      const stops = optimizeRoute(availableHouses);
      const routeId = uuidv4();
      const totalDist = calculateTotalDistance(stops);

      await Route.create({ id: routeId, driver_id: req.user.id, date: today, ward: 'All', stops: stops.map(s => s.id), total_distance: totalDist, estimated_time: totalDist * 3 });

      // Create pending collections in bulk (reduce N DB calls)
      const createdStopIds = stops.map(s => s.id);
      if (createdStopIds.length) {
        const existingCols = await Collection.find({ household_id: { $in: createdStopIds }, date: today }).lean();
        const existingHouseholdIds = new Set(existingCols.map(c => c.household_id));
        const toInsert = stops
          .filter(s => !existingHouseholdIds.has(s.id))
          .map(s => ({ id: uuidv4(), household_id: s.id, driver_id: req.user.id, date: today, status: 'pending', timestamp: new Date() }));
        if (toInsert.length) {
          await Collection.insertMany(toInsert);
        }
      }

      route = await Route.findOne({ id: routeId }).lean();
      await createNotification(req.user.id, `New route assigned with ${stops.length} stops. Estimated distance: ${totalDist.toFixed(1)} km.`, 'reminder');
    }

    // Get stop details in a single query and preserve original route order
    const stopIds = Array.isArray(route.stops) ? route.stops : JSON.parse(route.stops || '[]');
    let stops = [];
    if (stopIds.length) {
      const hAgg = await Household.aggregate([
        { $match: { id: { $in: stopIds } } },
        { $lookup: { from: 'users', localField: 'user_id', foreignField: 'id', as: 'user' } },
        { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
        { $lookup: { from: 'collections', let: { hid: '$id' }, pipeline: [ { $match: { $expr: { $and: [ { $eq: ['$household_id', '$$hid'] }, { $eq: ['$date', today] } ] } } }, { $project: { status: 1, id: 1 } } ], as: 'collection' } },
        { $unwind: { path: '$collection', preserveNullAndEmptyArrays: true } },
        { $project: { id: 1, address: 1, ward: 1, latitude: 1, longitude: 1, resident_name: '$user.name', resident_phone: '$user.phone', collection_status: '$collection.status', collection_id: '$collection.id' } }
      ]);
      const map = new Map();
      for (const h of hAgg) map.set(h.id, h);
      stops = stopIds.map(id => map.get(id) || { id });
    }

    res.json({ route, stops });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update collection status
router.put('/collect/:collectionId', auth, requireRole('driver'), async (req, res) => {
  try {
    const { status } = req.body;
    if (!['collected', 'skipped', 'closed'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status.' });
    }

    await Collection.updateOne({ id: req.params.collectionId }, { $set: { status, timestamp: new Date() } });

    // Get the household and resident for this collection
    const collection = await Collection.aggregate([
      { $match: { id: req.params.collectionId } },
      { $lookup: { from: 'households', localField: 'household_id', foreignField: 'id', as: 'household' } },
      { $unwind: { path: '$household', preserveNullAndEmptyArrays: true } },
      { $project: { household_id: 1, 'household.user_id': 1, 'household.address': 1 } }
    ]);
    const coll = collection.length ? collection[0] : null;

    if (coll) {
      const householdUserId = coll.household && coll.household.user_id ? coll.household.user_id : null;
      if (status === 'collected') {
        if (householdUserId) await createNotification(householdUserId, 'Your garbage has been collected! You earned 2 reward points.', 'info');
        await Incentive.create({ id: uuidv4(), household_id: coll.household_id, points: 2, reason: 'Garbage collected on time', date: new Date().toISOString().split('T')[0] });
      } else if (status === 'skipped') {
        if (householdUserId) await createNotification(householdUserId, 'Collection was skipped at your address today. Please ensure garbage is accessible.', 'alert');
      } else if (status === 'closed') {
        if (householdUserId) await createNotification(householdUserId, 'Collection marked as closed for your address today.', 'reminder');
      }
    }

    res.json({ message: 'Collection status updated.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Complete route
router.put('/complete/:routeId', auth, requireRole('driver'), async (req, res) => {
  try {
    await Route.updateOne({ id: req.params.routeId, driver_id: req.user.id }, { $set: { status: 'completed' } });
    await createNotification(req.user.id, 'Route completed successfully! Great work today.', 'info');
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
