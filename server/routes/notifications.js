const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { auth } = require('../middleware/auth');
const { Notification } = require('../models');

const router = express.Router();

// Helper: create a notification (exported for use in other routes)
async function createNotification(userId, message, type = 'info') {
  const id = uuidv4();
  await Notification.create({ id, user_id: userId, message, type });
  return id;
}

// Get user notifications
router.get('/', auth, async (req, res) => {
  try {
    const notifications = await Notification.find({ user_id: req.user.id }).sort({ created_at: -1 }).limit(50).lean();
    res.json({ notifications });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Mark notification as read
router.put('/:id/read', auth, async (req, res) => {
  try {
    await Notification.updateOne({ id: req.params.id, user_id: req.user.id }, { $set: { read: true } });
    res.json({ message: 'Notification marked as read.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Mark all notifications as read
router.put('/read-all', auth, async (req, res) => {
  try {
    await Notification.updateMany({ user_id: req.user.id, read: false }, { $set: { read: true } });
    res.json({ message: 'All notifications marked as read.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
module.exports.createNotification = createNotification;
