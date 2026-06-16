const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { User, Household, createUniqueHouseholdId } = require('../models');
const { auth } = require('../middleware/auth');

const DEFAULT_JWT_SECRET = 'dev-local-unsafe-jwt-secret';
const JWT_SECRET = process.env.JWT_SECRET || DEFAULT_JWT_SECRET;

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, phone, password, role = 'resident', address, latitude, longitude, numResidents, ward, language } = req.body;

    if (!name || !phone || !password) {
      return res.status(400).json({ error: 'Name, phone and password are required.' });
    }

    const existing = await User.findOne({ phone }).lean();
    if (existing) return res.status(409).json({ error: 'Phone number already registered.' });

    const id = uuidv4();
    const hashed = bcrypt.hashSync(password, 10);
    await User.create({ id, name, phone, password: hashed, role, language: language || 'en' });

    if (role === 'resident') {
      const householdId = await createUniqueHouseholdId();
      await Household.create({
        id: householdId,
        user_id: id,
        address: address || '',
        latitude: latitude || 0,
        longitude: longitude || 0,
        num_residents: numResidents || 1,
        ward: ward || 'Ward 1'
      });
    }

    const token = jwt.sign({ id, role, name }, JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ token, user: { id, name, phone, role } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { phone, password } = req.body;
    if (!phone || !password) return res.status(400).json({ error: 'Phone and password required.' });

    const user = await User.findOne({ phone }).lean();
    if (!user) return res.status(404).json({ error: 'User not found.' });

    const valid = bcrypt.compareSync(password, user.password);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials.' });

    const token = jwt.sign({ id: user.id, role: user.role, name: user.name }, JWT_SECRET, { expiresIn: '7d' });

    let household = null;
    if (user.role === 'resident') {
      household = await Household.findOne({ user_id: user.id }).lean();
    }

    res.json({ token, user: { id: user.id, name: user.name, phone: user.phone, role: user.role, language: user.language }, household });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get profile
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findOne({ id: req.user.id }).select('id name phone role language created_at').lean();
    if (!user) return res.status(404).json({ error: 'User not found.' });

    let household = null;
    if (user.role === 'resident') {
      household = await Household.findOne({ user_id: user.id }).lean();
    }
    res.json({ user, household });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
