const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const DEFAULT_LOCAL_MONGO_URI = 'mongodb://localhost:27017/ecocircle';

// Atlas / cloud URIs take priority over local Compass when configured.
const RAW_MONGO =
  process.env.MONGO_ATLAS_URL ||
  process.env.MONGO_ATLAS_RAW ||
  process.env.MONGODB_URI ||
  process.env.MONGO_URI ||
  process.env.LOCAL_MONGO_URI ||
  DEFAULT_LOCAL_MONGO_URI;

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

const MONGO_URI = ensureDatabaseName(normalizeMongoUri(RAW_MONGO));

if (!MONGO_URI) {
  console.warn('Warning: no MongoDB URI configured. Falling back to localhost or memory server.');
}

mongoose.set('strictQuery', false);

const mongooseOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 15000,
  connectTimeoutMS: 15000,
};

function isLocalMongoUri(raw) {
  return /^(mongodb|mongodb\+srv):\/\/(localhost|127\.0\.0\.1|0\.0\.0\.0|\[::1\])/i.test(raw || '');
}

function isRemoteMongoConfigured() {
  const candidates = [
    process.env.MONGO_ATLAS_URL,
    process.env.MONGO_ATLAS_RAW,
    process.env.MONGODB_URI,
    process.env.MONGO_URI,
  ];
  return candidates.some((uri) => uri && !isLocalMongoUri(uri));
}

function getConnectionLabel(uri) {
  if (!uri) return 'MongoDB';
  if (isLocalMongoUri(uri)) return 'Local MongoDB (mongodb://localhost:27017/ecocircle)';
  if (/^mongodb\+srv:/i.test(uri)) return 'MongoDB Atlas (cloud)';
  return 'MongoDB (remote)';
}

// Initialize Mongoose with a tiered fallback strategy:
// 1) Configured URI (Atlas/cloud when MONGODB_URI is set, otherwise local Compass)
// 2) Local MongoDB fallback only when no remote URI is configured
// 3) In-memory MongoDB (mongodb-memory-server) for development when nothing else is available
(async function initMongoose() {
  const localFallback = ensureDatabaseName(normalizeMongoUri(process.env.LOCAL_MONGO_URI || DEFAULT_LOCAL_MONGO_URI));
  const remoteConfigured = isRemoteMongoConfigured();
  let memoryServerInstance = null;

  async function connectTo(uri) {
    await mongoose.connect(uri, mongooseOptions);
    mongoose.dbMode = isLocalMongoUri(uri) ? 'local' : 'remote';
    console.log(`Connection successful: ${getConnectionLabel(uri)}`);
  }

  try {
    if (!MONGO_URI) {
      throw new Error('No MongoDB URI configured');
    }
    await connectTo(MONGO_URI);
  } catch (err) {
    console.warn('Primary MongoDB connection failed:', err && err.message);
    console.warn('Attempting to fall back to local database or in-memory MongoDB...');

    try {
      await connectTo(localFallback);
    } catch (err2) {
      console.warn('Failed to connect to Local MongoDB fallback:', err2 && err2.message);
      console.warn('Attempting to start an in-memory MongoDB for development (mongodb-memory-server)...');
      try {
        const { MongoMemoryServer } = require('mongodb-memory-server');
        const mongod = await MongoMemoryServer.create();
        memoryServerInstance = mongod;
        const uri = ensureDatabaseName(mongod.getUri());
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
  // phone is optional for municipal residents — they log in via House ID, not phone.
  // Phone is stored only for Twilio WhatsApp notifications.
  phone: { type: String, sparse: true, unique: true, default: null },
  email: { type: String, sparse: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['resident', 'driver', 'admin'], required: true },
  zone: { type: String, default: '' },
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

// Single-document singleton — only one record ever exists (id: 'singleton')
const ReportingWindowSchema = new Schema({
  id: { type: String, default: 'singleton', unique: true },
  is_open: { type: Boolean, default: false },
  opened_by: { type: String, default: null },
  updated_at: { type: Date, default: Date.now }
});

// Performance: create useful indexes to speed common queries
ReportingWindowSchema.index({ id: 1 }, { unique: true });
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
const ReportingWindow = mongoose.model('ReportingWindow', ReportingWindowSchema);

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
    // Guard: skip if H1 household already exists
    const h1Exists = await Household.findOne({ id: 'H1' }).lean();
    if (h1Exists) {
      console.log('Seed already applied (H1 exists). Skipping.');
      return;
    }

    // ── Admin ────────────────────────────────────────────────────────────────
    const adminExists = await User.findOne({ phone: '9999999999' }).lean();
    if (!adminExists) {
      const adminId = uuidv4();
      await User.create({
        id: adminId, name: 'Admin User', phone: '9999999999',
        password: bcrypt.hashSync('admin123', 10), role: 'admin',
      });
    }

    // ── Drivers ──────────────────────────────────────────────────────────────
    const driverPhones = ['8000000001', '8000000002', '8000000003'];
    for (const p of driverPhones) {
      const exists = await User.findOne({ phone: p }).lean();
      if (!exists) {
        await User.create({
          id: uuidv4(), name: `Driver ${p.slice(-1)}`, phone: p,
          password: bcrypt.hashSync('driver123', 10), role: 'driver',
        });
      }
    }

    // ── Municipal Households H1–H45 ───────────────────────────────────────────
    const wards   = ['Ward 1', 'Ward 2', 'Ward 3'];
    const zones   = ['Zone A', 'Zone B', 'Zone C'];
    const streets = [
      'Anna Salai', 'Gandhi Road', 'Nehru Street', 'Rajaji Road', 'Patel Nagar',
      'Ambedkar Street', 'Kamaraj Avenue', 'Bharathi Road', 'Subhash Nagar', 'MGR Street',
    ];
    const residentNames = [
      'Ravi Kumar',    'Priya Sharma',  'Arun Singh',    'Meena Devi',    'Karthik R',
      'Lakshmi N',     'Suresh B',      'Anitha M',      'Vijay K',       'Deepa S',
      'Ganesh P',      'Saranya L',     'Murugan T',     'Kavitha R',     'Selvam D',
      'Indira V',      'Balan S',       'Usha K',        'Ramesh G',      'Nalini P',
      'Senthil M',     'Revathi A',     'Dinesh C',      'Gomathi S',     'Prakash V',
      'Vasantha R',    'Manoj T',       'Sumathi K',     'Ashok B',       'Radha N',
      'Srinivasan P',  'Chitra M',      'Balaji S',      'Nithya R',      'Pandian K',
      'Kalaiselvi M',  'Venkat S',      'Savitha R',     'Moorthy N',     'Latha K',
      'Saravanan P',   'Devi R',        'Harish M',      'Malathi S',     'Rajesh V',
    ];
    const baseLat = 13.0827;
    const baseLng = 80.2707;
    const wasteTypes = ['organic', 'recyclable', 'mixed', 'hazardous'];
    const driver = await User.findOne({ role: 'driver' }).lean();

    for (let i = 1; i <= 45; i++) {
      const houseId  = `H${i}`;
      const password = `H${i}@2026`;
      const name     = residentNames[i - 1] || `Resident H${i}`;
      const ward     = wards[(i - 1) % 3];
      const zone     = zones[(i - 1) % 3];
      const street   = streets[(i - 1) % streets.length];
      const address  = `${i}, ${street}, Chennai`;
      const phone    = `70000${String(i).padStart(5, '0')}`;  // synthetic, for Twilio

      // Create User
      const userId = uuidv4();
      await User.create({
        id: userId,
        name,
        phone,
        password: bcrypt.hashSync(password, 10),
        role: 'resident',
        zone,
      });

      // Create Household with exact municipal ID
      await Household.create({
        id: houseId,
        user_id: userId,
        address,
        latitude:  baseLat + (((i * 17) % 100) - 50) * 0.001,
        longitude: baseLng + (((i * 13) % 100) - 50) * 0.001,
        num_residents: (i % 5) + 1,
        ward,
      });

      // Seed 14 days of garbage reports + collections + incentives
      for (let d = 1; d <= 14; d++) {
        const date = new Date();
        date.setDate(date.getDate() - d);
        const dateStr  = date.toISOString().split('T')[0];
        const available = (i + d) % 4 !== 0;  // deterministic — ~75% reporting rate
        const wasteType = wasteTypes[(i + d) % wasteTypes.length];

        await GarbageReport.create({
          id: uuidv4(), household_id: houseId, date: dateStr,
          available, waste_type: wasteType,
        });

        if (available && d > 0 && driver) {
          const status = ['collected', 'collected', 'collected', 'skipped'][(i + d) % 4];
          await Collection.create({
            id: uuidv4(), household_id: houseId, driver_id: driver.id,
            date: dateStr, status,
          });
          if (status === 'collected') {
            await Incentive.create({
              id: uuidv4(), household_id: houseId,
              points: wasteType !== 'mixed' ? 10 : 5,
              reason: wasteType !== 'mixed' ? `Proper ${wasteType} segregation` : 'Regular reporting',
              date: dateStr,
            });
          }
        }
      }
    }

    console.log('✅ Seeded municipal households H1–H45 into MongoDB');
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
  ReportingWindow,
  createUniqueHouseholdId,
  seedData
};
