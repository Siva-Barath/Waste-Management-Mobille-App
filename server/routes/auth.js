const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const db = require('../database');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Register
router.post('/register', (req, res) => {
  try {
    const { name, phone, password, role = 'resident', address, latitude, longitude, numResidents, ward, language } = req.body;

    if (!name || !phone || !password) {
      return res.status(400).json({ error: 'Name, phone and password are required.' });
    }

    const existing = db.prepare('SELECT id FROM users WHERE phone = ?').get(phone);
    if (existing) return res.status(409).json({ error: 'Phone number already registered.' });

    const id = uuidv4();
    const hashed = bcrypt.hashSync(password, 10);
    db.prepare('INSERT INTO users (id, name, phone, password, role, language) VALUES (?, ?, ?, ?, ?, ?)').run(id, name, phone, hashed, role, language || 'en');

    if (role === 'resident') {
      const householdId = 'H' + Date.now().toString().slice(-6);
      db.prepare('INSERT INTO households (id, user_id, address, latitude, longitude, num_residents, ward) VALUES (?, ?, ?, ?, ?, ?, ?)').run(
        householdId, id, address || '', latitude || 0, longitude || 0, numResidents || 1, ward || 'Ward 1'
      );
    }

    const token = jwt.sign({ id, role, name }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ token, user: { id, name, phone, role } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Login
router.post('/login', (req, res) => {
  try {
    const { phone, password } = req.body;
    if (!phone || !password) return res.status(400).json({ error: 'Phone and password required.' });

    const user = db.prepare('SELECT * FROM users WHERE phone = ?').get(phone);
    if (!user) return res.status(404).json({ error: 'User not found.' });

    const valid = bcrypt.compareSync(password, user.password);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials.' });

    const token = jwt.sign({ id: user.id, role: user.role, name: user.name }, process.env.JWT_SECRET, { expiresIn: '7d' });

    let household = null;
    if (user.role === 'resident') {
      household = db.prepare('SELECT * FROM households WHERE user_id = ?').get(user.id);
    }

    res.json({ token, user: { id: user.id, name: user.name, phone: user.phone, role: user.role, language: user.language }, household });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get profile
router.get('/profile', auth, (req, res) => {
  try {
    const user = db.prepare('SELECT id, name, phone, role, language, created_at FROM users WHERE id = ?').get(req.user.id);
    let household = null;
    if (user.role === 'resident') {
      household = db.prepare('SELECT * FROM households WHERE user_id = ?').get(user.id);
    }
    res.json({ user, household });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
