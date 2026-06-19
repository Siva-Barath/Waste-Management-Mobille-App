const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { User, Household, createUniqueHouseholdId } = require('../models');
const { createNotification } = require('./notifications');
const { auth } = require('../middleware/auth');
const {
  normalizePhone,
  validatePhone,
  validateEmail,
  validatePassword,
} = require('../utils/authValidation');

const DEFAULT_JWT_SECRET = 'dev-local-unsafe-jwt-secret';
const JWT_SECRET = process.env.JWT_SECRET || DEFAULT_JWT_SECRET;

const router = express.Router();

const DEFAULT_WARDS = ['Ward 1', 'Ward 2', 'Ward 3'];

router.get('/wards', async (req, res) => {
  try {
    const distinct = await Household.distinct('ward');
    const wards = [...new Set([...DEFAULT_WARDS, ...distinct.filter(Boolean)])].sort();
    res.json({ wards });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/register', async (req, res) => {
  try {
    const {
      name,
      phone,
      email,
      password,
      role = 'resident',
      address,
      latitude,
      longitude,
      numResidents,
      ward,
    } = req.body;

    if (!name || !phone || !password || !email) {
      return res.status(400).json({ error: 'Name, phone, email and password are required.' });
    }

    if (!validatePhone(phone)) {
      return res.status(400).json({ error: 'Phone number must be exactly 10 digits and start with 6–9.' });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({ error: 'Enter a valid email address (e.g. name@gmail.com).' });
    }

    if (!validatePassword(password)) {
      return res.status(400).json({
        error: 'Password must be at least 8 characters with uppercase, lowercase, and a digit.',
      });
    }

    const normalizedPhone = normalizePhone(phone);
    const normalizedEmail = String(email).trim().toLowerCase();

    const existingPhone = await User.findOne({ phone: normalizedPhone }).lean();
    if (existingPhone) {
      return res.status(409).json({ error: 'Phone number already registered.' });
    }

    const existingEmail = await User.findOne({ email: normalizedEmail }).lean();
    if (existingEmail) {
      return res.status(409).json({ error: 'Email already registered.' });
    }

    const id = uuidv4();
    const hashed = bcrypt.hashSync(password, 10);
    await User.create({
      id,
      name: String(name).trim(),
      phone: normalizedPhone,
      email: normalizedEmail,
      password: hashed,
      role,
    });

    let household = null;
    if (role === 'resident') {
      const householdId = await createUniqueHouseholdId();
      await Household.create({
        id: householdId,
        user_id: id,
        address: address || '',
        latitude: latitude || 0,
        longitude: longitude || 0,
        num_residents: numResidents || 1,
        ward: ward || 'Ward 1',
      });
      household = await Household.findOne({ user_id: id }).lean();
      await createNotification(
        id,
        `Welcome to EcoCircle, ${String(name).trim()}! Your household in ${ward || 'Ward 1'} is registered.`,
        'info'
      );
    }

    const token = jwt.sign({ id, role, name: String(name).trim() }, JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({
      token,
      user: { id, name: String(name).trim(), phone: normalizedPhone, email: normalizedEmail, role },
      household,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { phone, password } = req.body;
    if (!phone || !password) {
      return res.status(400).json({ error: 'Phone and password are required.' });
    }

    if (!validatePhone(phone)) {
      return res.status(400).json({ error: 'Phone number must be exactly 10 digits and start with 6–9.' });
    }

    const normalizedPhone = normalizePhone(phone);
    const user = await User.findOne({ phone: normalizedPhone }).lean();
    if (!user) {
      return res.status(404).json({ error: 'User not found. Please register first.' });
    }

    const valid = bcrypt.compareSync(password, user.password);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid password.' });
    }

    const token = jwt.sign({ id: user.id, role: user.role, name: user.name }, JWT_SECRET, { expiresIn: '7d' });

    let household = null;
    if (user.role === 'resident') {
      household = await Household.findOne({ user_id: user.id }).lean();
    }

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        role: user.role,
      },
      household,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findOne({ id: req.user.id })
      .select('id name phone email role created_at')
      .lean();
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
