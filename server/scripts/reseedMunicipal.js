/**
 * reseedMunicipal.js
 * ------------------
 * Wipes all existing resident users / households / reports / collections /
 * incentives and re-seeds H1–H45 with passwords H1@2026 … H45@2026.
 *
 * Run once:
 *   node server/scripts/reseedMunicipal.js
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const bcrypt    = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

// Bootstrap mongoose connection via the shared models module
const {
  mongoose, User, Household, GarbageReport,
  Collection, Incentive,
} = require('../models');

async function waitForConnection(retries = 20) {
  for (let i = 0; i < retries; i++) {
    if (mongoose.connection.readyState === 1) return;
    await new Promise(r => setTimeout(r, 500));
  }
  throw new Error('MongoDB connection not ready after 10 s');
}

async function run() {
  await waitForConnection();
  console.log('Connected. Starting municipal re-seed…');

  // 1. Collect existing resident user IDs so we can wipe their linked data
  const residentUsers = await User.find({ role: 'resident' }).select('id').lean();
  const residentIds   = residentUsers.map(u => u.id);
  const households    = await Household.find({ user_id: { $in: residentIds } }).select('id').lean();
  const householdIds  = households.map(h => h.id);

  // 2. Delete everything linked to old residents
  await Promise.all([
    User.deleteMany({ role: 'resident' }),
    Household.deleteMany({ user_id: { $in: residentIds } }),
    GarbageReport.deleteMany({ household_id: { $in: householdIds } }),
    Collection.deleteMany({ household_id: { $in: householdIds } }),
    Incentive.deleteMany({ household_id: { $in: householdIds } }),
  ]);
  console.log(`Deleted ${residentIds.length} old resident accounts and all linked data.`);

  // 3. Seed H1–H45
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

  const baseLat   = 13.0827;
  const baseLng   = 80.2707;
  const wasteTypes = ['organic', 'recyclable', 'mixed', 'hazardous'];
  const driver    = await User.findOne({ role: 'driver' }).lean();

  for (let i = 1; i <= 45; i++) {
    const houseId  = `H${i}`;
    const password = `H${i}@2026`;
    const name     = residentNames[i - 1] || `Resident H${i}`;
    const ward     = wards[(i - 1) % 3];
    const zone     = zones[(i - 1) % 3];
    const street   = streets[(i - 1) % streets.length];
    const address  = `${i}, ${street}, Chennai`;
    const phone    = `70000${String(i).padStart(5, '0')}`;  // synthetic for Twilio

    const userId = uuidv4();
    await User.create({
      id: userId, name, phone,
      password: bcrypt.hashSync(password, 10),
      role: 'resident', zone,
    });

    await Household.create({
      id: houseId, user_id: userId, address,
      latitude:  baseLat + (((i * 17) % 100) - 50) * 0.001,
      longitude: baseLng + (((i * 13) % 100) - 50) * 0.001,
      num_residents: (i % 5) + 1,
      ward,
    });

    // 14 days of history
    for (let d = 1; d <= 14; d++) {
      const date = new Date();
      date.setDate(date.getDate() - d);
      const dateStr   = date.toISOString().split('T')[0];
      const available = (i + d) % 4 !== 0;
      const wasteType = wasteTypes[(i + d) % wasteTypes.length];

      await GarbageReport.create({
        id: uuidv4(), household_id: houseId,
        date: dateStr, available, waste_type: wasteType,
      });

      if (available && driver) {
        const status = ['collected', 'collected', 'collected', 'skipped'][(i + d) % 4];
        await Collection.create({
          id: uuidv4(), household_id: houseId,
          driver_id: driver.id, date: dateStr, status,
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

    process.stdout.write(`  Seeded ${houseId}\r`);
  }

  console.log('\n✅ Municipal households H1–H45 seeded successfully.');
  console.log('   Test credentials:  H1 / H1@2026   H25 / H25@2026   H45 / H45@2026');
  process.exit(0);
}

run().catch(err => { console.error(err); process.exit(1); });
