const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../database');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Helper: create a notification (exported for use in other routes)
function createNotification(userId, message, type = 'info') {
  const id = uuidv4();
  db.prepare('INSERT INTO notifications (id, user_id, message, type) VALUES (?, ?, ?, ?)').run(id, userId, message, type);
  return id;
}

// Get user notifications
router.get('/', auth, (req, res) => {
  try {
    const notifications = db.prepare('SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50').all(req.user.id);
    res.json({ notifications });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Mark notification as read
router.put('/:id/read', auth, (req, res) => {
  try {
    db.prepare('UPDATE notifications SET read = 1 WHERE id = ? AND user_id = ?').run(req.params.id, req.user.id);
    res.json({ message: 'Notification marked as read.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Mark all notifications as read
router.put('/read-all', auth, (req, res) => {
  try {
    db.prepare('UPDATE notifications SET read = 1 WHERE user_id = ? AND read = 0').run(req.user.id);
    res.json({ message: 'All notifications marked as read.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
module.exports.createNotification = createNotification;
