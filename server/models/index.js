const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const DEFAULT_LOCAL_MONGO_URI = 'mongodb://localhost:27017/ecocircle';

const RAW_MONGO = process.env.LOCAL_MONGO_URI || process.env.MONGO_URI || process.env.MONGODB_URI || process.env.MONGO_ATLAS_URL || process.env.MONGO_ATLAS_RAW || DEFAULT_LOCAL_MONGO_URI;

function normalizeMongoUri(raw) {
  if (!raw) return raw;
  const schemeIdx = raw.indexOf('://');
  if (schemeIdx === -1) return raw;
  const schemePrefix = raw.substring(0, schemeIdx + 3);
  const afterScheme = raw.substring(schemeIdx + 3);
  const atIdx = afterScheme.lastIndexOf('@');
  if (atIdx === -1) return raw;
  const authPart = afterScheme.substring(0, atIdx);
  const hostPart = afterScheme.substring(atIdx + 1);
  // If auth part already percent-encoded, return raw
  if (/%[0-9A-Fa-f]{2}/.test(authPart)) return raw;
  const colonIdx = authPart.indexOf(':');
  if (colonIdx === -1) return raw;
  const username = authPart.substring(0, colonIdx);
  const password = authPart.substring(colonIdx + 1);
  return schemePrefix + encodeURIComponent(username) + ':' + encodeURIComponent(password) + '@' + hostPart;
}

const MONGO_URI = normalizeMongoUri(RAW_MONGO);

if (!MONGO_URI) {
  console.warn('Warning: no MongoDB URI configured. Falling back to localhost or memory server.');
}

mongoose.set('strictQuery', false);

const mongooseOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000,
  connectTimeoutMS: 10000,
};

function ensureDatabaseName(raw, databaseName = 'ecocircle') {
  if (!raw) return raw;
  const schemeIdx = raw.indexOf('://');
  if (schemeIdx === -1) return raw;

  const queryIdx = raw.indexOf('?', schemeIdx + 3);
  const pathEndIdx = queryIdx === -1 ? raw.length : queryIdx;
  const pathStartIdx = raw.indexOf('/', schemeIdx + 3);
  if (pathStartIdx === -1 || pathStartIdx >= pathEndIdx) {
    const suffix = queryIdx === -1 ? '' : raw.substring(queryIdx);
    return `${raw.substring(0, pathEndIdx)}/${databaseName}${suffix}`;
  }

  const path = raw.substring(pathStartIdx + 1, pathEndIdx);
  if (!path) {
    return `${raw.substring(0, pathStartIdx + 1)}${databaseName}${raw.substring(pathEndIdx)}`;
  }

  return raw;
}

function isLocalMongoUri(raw) {
  return /^(mongodb|mongodb\+srv):\/\/(localhost|127\.0\.0\.1|0\.0\.0\.0|\[::1\])/i.test(raw || '');
}

// Initialize Mongoose with a tiered fallback strategy:
// 1) Local MongoDB (localhost is the default for local development)
// 2) Explicit remote URI if one is configured
// 3) In-memory MongoDB (mongodb-memory-server) for development when nothing else is available
(async function initMongoose() {
  const localFallback = ensureDatabaseName(normalizeMongoUri(process.env.LOCAL_MONGO_URI || DEFAULT_LOCAL_MONGO_URI));
  let memoryServerInstance = null;
  try {
    let connected = false;

    if (MONGO_URI && isLocalMongoUri(MONGO_URI)) {
      await mongoose.connect(MONGO_URI, mongooseOptions);
      mongoose.dbMode = 'local';
      console.log('Connection successful: Local MongoDB (mongodb://localhost:27017/ecocircle)');
      connected = true;
    }

    if (!connected) {
      if (localFallback) {
        try {
          await mongoose.connect(localFallback, mongooseOptions);
          mongoose.dbMode = 'local';
          console.log('Connection successful: Local MongoDB (mongodb://localhost:27017/ecocircle)');
          connected = true;
        } catch (localErr) {
          console.warn('Failed to connect to Local MongoDB:', localErr && localErr.message);
        }
      }

      if (!connected && MONGO_URI) {
        await mongoose.connect(MONGO_URI, mongooseOptions);
        mongoose.dbMode = isLocalMongoUri(MONGO_URI) ? 'local' : 'remote';
        console.log('Connection successful: MongoDB');
        connected = true;
      }

      if (!connected) {
        throw new Error('No MongoDB URI configured');
      }
    }
  } catch (err) {
    console.warn('Primary MongoDB connection failed:', err && err.message);
    try {
      await mongoose.connect(localFallback, mongooseOptions);
      mongoose.dbMode = 'local';
      console.log('Connection successful: Local MongoDB (mongodb://localhost:27017/ecocircle)');
    } catch (err2) {
      console.warn('Failed to connect to Local MongoDB fallback:', err2 && err2.message);
      console.warn('Attempting to start an in-memory MongoDB for development (mongodb-memory-server)...');
      try {
        // Lazy require so this package is optional in production setups
        const { MongoMemoryServer } = require('mongodb-memory-server');
        const mongod = await MongoMemoryServer.create();
        memoryServerInstance = mongod;
        const uri = mongod.getUri();
        await mongoose.connect(uri, mongooseOptions);
        mongoose.dbMode = 'memory';
        console.log('Connection successful: In-memory MongoDB (MongoMemoryServer)');
      } catch (memErr) {
        console.error('In-memory MongoDB fallback failed:', memErr && memErr.message);
        console.error('No database connections available. Exiting.');
        process.exit(1);
      }
    }
  }

  // Seed demo data after successful connection
  try {
    if (process.env.SKIP_SEED && process.env.SKIP_SEED.toLowerCase() === 'true') {
      console.log('Skipping DB seed because SKIP_SEED=true');
    } else {
      await seedData();
    }
  } catch (e) {
    console.error('Seed invocation error:', e && e.message);
  }

  // Graceful shutdown: stop memory server if started
  process.on('SIGINT', async () => {
    try { await mongoose.disconnect(); } catch {}
    try { if (memoryServerInstance && typeof memoryServerInstance.stop === 'function') await memoryServerInstance.stop(); } catch {}
    process.exit(0);
  });
})();

const Schema = mongoose.Schema;

const UserSchema = new Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  email: { type: String, sparse: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['resident', 'driver', 'admin'], required: true },
  language: { type: String, default: 'en' },
  created_at: { type: Date, default: Date.now }
});

const HouseholdSchema = new Schema({
  id: { type: String, required: true, unique: true },
  user_id: { type: String, required: true },
  address: { type: String, default: '' },
  latitude: { type: Number, default: 0 },
  longitude: { type: Number, default: 0 },
  num_residents: { type: Number, default: 1 },
  ward: { type: String, default: 'Ward 1' },
  created_at: { type: Date, default: Date.now }
});

const GarbageReportSchema = new Schema({
  id: { type: String, required: true, unique: true },
  household_id: { type: String, required: true },
  date: { type: String, required: true },
  available: { type: Boolean, default: false },
  waste_type: { type: String, default: 'mixed' },
  timestamp: { type: Date, default: Date.now }
});

const CollectionSchema = new Schema({
  id: { type: String, required: true, unique: true },
  household_id: { type: String, required: true },
  driver_id: { type: String, default: null },
  date: { type: String, required: true },
  status: { type: String, default: 'pending' },
  timestamp: { type: Date, default: Date.now }
});

const RouteSchema = new Schema({
  id: { type: String, required: true, unique: true },
  driver_id: { type: String, required: true },
  date: { type: String, required: true },
  ward: { type: String, default: 'All' },
  stops: { type: [String], default: [] },
  total_distance: { type: Number, default: 0 },
  estimated_time: { type: Number, default: 0 },
  status: { type: String, default: 'active' },
  created_at: { type: Date, default: Date.now }
});

const NotificationSchema = new Schema({
  id: { type: String, required: true, unique: true },
  user_id: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, default: 'reminder' },
  read: { type: Boolean, default: false },
  created_at: { type: Date, default: Date.now }
});

const IncentiveSchema = new Schema({
  id: { type: String, required: true, unique: true },
  household_id: { type: String, required: true },
  points: { type: Number, default: 0 },
  reason: { type: String, default: '' },
  date: { type: String, required: true },
  created_at: { type: Date, default: Date.now }
});

// Performance: create useful indexes to speed common queries
UserSchema.index({ phone: 1 }, { unique: true });
UserSchema.index({ role: 1 });
HouseholdSchema.index({ user_id: 1 });
HouseholdSchema.index({ id: 1 }, { unique: true });
GarbageReportSchema.index({ household_id: 1, date: 1 });
GarbageReportSchema.index({ date: 1, available: 1 });
CollectionSchema.index({ household_id: 1, date: 1 });
CollectionSchema.index({ driver_id: 1, date: 1 });
RouteSchema.index({ driver_id: 1, date: 1 });
NotificationSchema.index({ user_id: 1 });
IncentiveSchema.index({ household_id: 1, date: 1 });

const User = mongoose.model('User', UserSchema);
const Household = mongoose.model('Household', HouseholdSchema);
const GarbageReport = mongoose.model('GarbageReport', GarbageReportSchema);
const Collection = mongoose.model('Collection', CollectionSchema);
const Route = mongoose.model('Route', RouteSchema);
const Notification = mongoose.model('Notification', NotificationSchema);
const Incentive = mongoose.model('Incentive', IncentiveSchema);

async function createUniqueHouseholdId() {
  for (let attempt = 0; attempt < 8; attempt += 1) {
    const id = `H${uuidv4().replace(/-/g, '').slice(0, 10).toUpperCase()}`;
    const existing = await Household.findOne({ id }).lean();
    if (!existing) return id;
  }
  return `H${Date.now()}${Math.floor(Math.random() * 1000)}`;
}

async function seedData() {
  try {
    const admin = await User.findOne({ phone: '9999999999' }).lean();
    if (admin) return; // already seeded

    // Create admin
    const adminId = uuidv4();
    await User.create({ id: adminId, name: 'Admin User', phone: '9999999999', password: bcrypt.hashSync('admin123', 10), role: 'admin' });

    // Drivers
    const driverPhones = ['8000000001', '8000000002', '8000000003'];
    for (const p of driverPhones) {
      await User.create({ id: uuidv4(), name: `Driver ${p.slice(-1)}`, phone: p, password: bcrypt.hashSync('driver123', 10), role: 'driver' });
    }

    // Demo resident and households
    const demoResidentId = uuidv4();
    await User.create({ id: demoResidentId, name: 'Resident Demo', phone: '7000000000', password: bcrypt.hashSync('user123', 10), role: 'resident' });
    const householdId = await createUniqueHouseholdId();
    await Household.create({ id: householdId, user_id: demoResidentId, address: '100 Main Street, Chennai', latitude: 13.0827, longitude: 80.2707, num_residents: 3, ward: 'Ward 1' });

    // Additional residents
    const wards = ['Ward 1', 'Ward 2', 'Ward 3'];
    const names = ['Ravi Kumar', 'Priya Sharma', 'Arun Singh', 'Meena Devi', 'Karthik R', 'Lakshmi N', 'Suresh B', 'Anitha M', 'Vijay K', 'Deepa S', 'Ganesh P', 'Saranya L'];
    const baseLat = 13.0827;
    const baseLng = 80.2707;

    for (let i = 0; i < names.length; i++) {
      const phone = `700000000${i}`;
      const u = await User.findOne({ phone }).lean();
      let userId;
      if (u) userId = u.id;
      else {
        userId = uuidv4();
        await User.create({ id: userId, name: names[i], phone, password: bcrypt.hashSync('user123', 10), role: 'resident' });
      }

      let house = await Household.findOne({ user_id: userId }).lean();
      if (!house) {
        const hid = `H${100 + i + 1}`;
        const idTaken = await Household.findOne({ id: hid }).lean();
        const householdIdToUse = idTaken ? `H${uuidv4().replace(/-/g, '').slice(0, 10).toUpperCase()}` : hid;
        await Household.create({ id: householdIdToUse, user_id: userId, address: `${100 + i} Main Street, Chennai`, latitude: baseLat + (Math.random() - 0.5) * 0.05, longitude: baseLng + (Math.random() - 0.5) * 0.05, num_residents: Math.floor(Math.random() * 5) + 2, ward: wards[i % 3] });
      }

      // Create some garbage reports and incentives
      for (let d = 0; d < 7; d++) {
        const date = new Date();
        date.setDate(date.getDate() - d);
        const dateStr = date.toISOString().split('T')[0];
        const available = Math.random() > 0.3;
        const types = ['biodegradable', 'recyclable', 'mixed', 'hazardous'];
        await GarbageReport.create({ id: uuidv4(), household_id: (await Household.findOne({ user_id: userId }).lean()).id, date: dateStr, available, waste_type: types[Math.floor(Math.random() * types.length)] });
        if (available && d > 0) {
          await Collection.create({ id: uuidv4(), household_id: (await Household.findOne({ user_id: userId }).lean()).id, driver_id: (await User.findOne({ role: 'driver' }).lean()).id, date: dateStr, status: ['collected','collected','collected','skipped'][Math.floor(Math.random()*4)] });
        }
        await Incentive.create({ id: uuidv4(), household_id: (await Household.findOne({ user_id: userId }).lean()).id, points: Math.floor(Math.random() * 50) + 10, reason: 'Consistent segregation', date: dateStr });
      }
    }

    console.log('✅ Seeded demo data into MongoDB');
  } catch (err) {
    console.error('Seed error:', err.message);
  }
}

// Note: seeding is invoked after successful DB connection above

module.exports = {
  mongoose,
  User,
  Household,
  GarbageReport,
  Collection,
  Route,
  Notification,
  Incentive,
  createUniqueHouseholdId,
  seedData
};
