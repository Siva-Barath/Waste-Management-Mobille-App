#!/usr/bin/env node
require('dotenv').config();
const mongoose = require('mongoose');

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
  if (/%[0-9A-Fa-f]{2}/.test(authPart)) return raw;
  const colonIdx = authPart.indexOf(':');
  if (colonIdx === -1) return raw;
  const username = authPart.substring(0, colonIdx);
  const password = authPart.substring(colonIdx + 1);
  return schemePrefix + encodeURIComponent(username) + ':' + encodeURIComponent(password) + '@' + hostPart;
}

const RAW_ATLAS = process.env.MONGO_ATLAS_RAW || process.env.MONGO_ATLAS_URL || process.env.MONGODB_URI || process.env.MONGO_URI;
const ATLAS_URI = normalizeMongoUri(RAW_ATLAS);
const LOCAL_URI = process.env.LOCAL_MONGO_URI || 'mongodb://localhost:27017/ecocircle';

const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 10000,
  connectTimeoutMS: 10000,
};

async function migrateCollection(localConn, atlasConn, name) {
  try {
    const localColl = localConn.collection(name);
    const atlasColl = atlasConn.collection(name);
    const docs = await localColl.find({}).toArray();
    if (!docs || !docs.length) {
      console.log(` - ${name}: no documents to migrate`);
      return 0;
    }

    const ops = [];
    for (const doc of docs) {
      const d = Object.assign({}, doc);
      delete d._id;
      ops.push({ updateOne: { filter: { id: d.id }, update: { $set: d }, upsert: true } });
      if (ops.length >= 500) {
        await atlasColl.bulkWrite(ops, { ordered: false });
        ops.length = 0;
      }
    }
    if (ops.length) await atlasColl.bulkWrite(ops, { ordered: false });
    return docs.length;
  } catch (err) {
    console.error(`Error migrating ${name}:`, err && err.message ? err.message : err);
    return -1;
  }
}

(async function main() {
  if (!ATLAS_URI) {
    console.error('No Atlas URI found in environment (MONGO_ATLAS_RAW or MONGO_ATLAS_URL).');
    process.exit(2);
  }

  let localConn, atlasConn;
  try {
    console.log('Connecting to local DB:', LOCAL_URI);
    localConn = await mongoose.createConnection(LOCAL_URI, options);
    console.log('Connected to local DB');
  } catch (err) {
    console.error('Failed to connect to local DB:', err && err.message ? err.message : err);
    process.exit(3);
  }

  try {
    const safeLog = ATLAS_URI.replace(/:[^:@]+@/, ':*****@');
    console.log('Connecting to Atlas:', safeLog);
    atlasConn = await mongoose.createConnection(ATLAS_URI, options);
    console.log('Connected to Atlas DB');
  } catch (err) {
    console.error('Failed to connect to Atlas:', err && err.message ? err.message : err);
    if (localConn) await localConn.close();
    process.exit(4);
  }

  const collections = ['users', 'households', 'garbagereports', 'collections', 'routes', 'notifications', 'incentives'];
  for (const c of collections) {
    process.stdout.write(`Migrating collection ${c}...`);
    const count = await migrateCollection(localConn, atlasConn, c);
    if (count === -1) console.log(' failed');
    else console.log(` done (${count} documents)`);
  }

  await localConn.close();
  await atlasConn.close();
  console.log('✅ Migration complete');
  process.exit(0);
})();
