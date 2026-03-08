const Database = require('better-sqlite3');
const path = require('path');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const db = new Database(path.join(__dirname, 'waste_management.db'));

// Enable WAL mode for better performance
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('resident','driver','admin')),
    language TEXT DEFAULT 'en',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS households (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id),
    address TEXT NOT NULL,
    latitude REAL,
    longitude REAL,
    num_residents INTEGER DEFAULT 1,
    ward TEXT DEFAULT 'Ward 1',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS garbage_reports (
    id TEXT PRIMARY KEY,
    household_id TEXT NOT NULL REFERENCES households(id),
    date TEXT NOT NULL,
    available INTEGER NOT NULL DEFAULT 0,
    waste_type TEXT DEFAULT 'mixed',
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS collections (
    id TEXT PRIMARY KEY,
    household_id TEXT NOT NULL REFERENCES households(id),
    driver_id TEXT REFERENCES users(id),
    date TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK(status IN ('pending','collected','skipped','closed')),
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS routes (
    id TEXT PRIMARY KEY,
    driver_id TEXT NOT NULL REFERENCES users(id),
    date TEXT NOT NULL,
    ward TEXT,
    stops TEXT NOT NULL,
    total_distance REAL,
    estimated_time REAL,
    status TEXT DEFAULT 'active' CHECK(status IN ('active','completed')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id),
    message TEXT NOT NULL,
    type TEXT DEFAULT 'reminder',
    read INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS incentives (
    id TEXT PRIMARY KEY,
    household_id TEXT NOT NULL REFERENCES households(id),
    points INTEGER DEFAULT 0,
    reason TEXT,
    date TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// Seed demo data
const seedData = () => {
  const existingAdmin = db.prepare('SELECT id FROM users WHERE role = ?').get('admin');
  if (existingAdmin) return;

  // Create admin
  const adminId = uuidv4();
  const adminPass = bcrypt.hashSync('admin123', 10);
  db.prepare('INSERT INTO users (id, name, phone, password, role) VALUES (?, ?, ?, ?, ?)').run(adminId, 'Admin User', '9999999999', adminPass, 'admin');

  // Create drivers
  const driverIds = [];
  for (let i = 1; i <= 3; i++) {
    const dId = uuidv4();
    driverIds.push(dId);
    const dPass = bcrypt.hashSync('driver123', 10);
    db.prepare('INSERT INTO users (id, name, phone, password, role) VALUES (?, ?, ?, ?, ?)').run(dId, `Driver ${i}`, `800000000${i}`, dPass, 'driver');
  }

  // Create residents with households
  const wards = ['Ward 1', 'Ward 2', 'Ward 3'];
  const names = ['Ravi Kumar', 'Priya Sharma', 'Arun Singh', 'Meena Devi', 'Karthik R', 'Lakshmi N', 'Suresh B', 'Anitha M', 'Vijay K', 'Deepa S', 'Ganesh P', 'Saranya L'];
  const baseLat = 13.0827;
  const baseLng = 80.2707;

  for (let i = 0; i < names.length; i++) {
    const userId = uuidv4();
    const householdId = `H${100 + i + 1}`;
    const pass = bcrypt.hashSync('user123', 10);
    const ward = wards[i % 3];

    db.prepare('INSERT INTO users (id, name, phone, password, role) VALUES (?, ?, ?, ?, ?)').run(userId, names[i], `700000000${i}`, pass, 'resident');
    db.prepare('INSERT INTO households (id, user_id, address, latitude, longitude, num_residents, ward) VALUES (?, ?, ?, ?, ?, ?, ?)').run(
      householdId, userId, `${100 + i} Main Street, Chennai`, baseLat + (Math.random() - 0.5) * 0.05, baseLng + (Math.random() - 0.5) * 0.05, Math.floor(Math.random() * 5) + 2, ward
    );

    // Create some garbage reports for the last 7 days
    for (let d = 0; d < 7; d++) {
      const date = new Date();
      date.setDate(date.getDate() - d);
      const dateStr = date.toISOString().split('T')[0];
      const available = Math.random() > 0.3 ? 1 : 0;
      const types = ['biodegradable', 'recyclable', 'mixed', 'hazardous'];
      db.prepare('INSERT INTO garbage_reports (id, household_id, date, available, waste_type) VALUES (?, ?, ?, ?, ?)').run(
        uuidv4(), householdId, dateStr, available, types[Math.floor(Math.random() * types.length)]
      );

      if (available && d > 0) {
        const statuses = ['collected', 'collected', 'collected', 'skipped'];
        db.prepare('INSERT INTO collections (id, household_id, driver_id, date, status) VALUES (?, ?, ?, ?, ?)').run(
          uuidv4(), householdId, driverIds[i % 3], dateStr, statuses[Math.floor(Math.random() * statuses.length)]
        );
      }
    }

    // Add incentive points
    db.prepare('INSERT INTO incentives (id, household_id, points, reason, date) VALUES (?, ?, ?, ?, ?)').run(
      uuidv4(), householdId, Math.floor(Math.random() * 50) + 10, 'Consistent segregation', new Date().toISOString().split('T')[0]
    );
  }
};

seedData();
module.exports = db;
