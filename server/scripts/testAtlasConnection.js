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

const RAW = process.env.MONGO_ATLAS_RAW || process.env.MONGO_ATLAS_URL || process.env.MONGODB_URI || process.env.MONGO_URI;
const MONGO_URI = normalizeMongoUri(RAW);

const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 10000,
  connectTimeoutMS: 10000,
};

(async () => {
  if (!MONGO_URI) {
    console.error('No Atlas URI found in environment (MONGO_ATLAS_RAW or MONGO_ATLAS_URL).');
    process.exit(2);
  }
  try {
    const safeLog = MONGO_URI.replace(/:[^:@]+@/, ':*****@');
    console.log('Testing MongoDB Atlas connection to:', safeLog);
    await mongoose.connect(MONGO_URI, options);
    console.log('✅ MongoDB Atlas connection successful');
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('❌ MongoDB Atlas connection failed:', err && err.message ? err.message : err);
    process.exit(3);
  }
})();
