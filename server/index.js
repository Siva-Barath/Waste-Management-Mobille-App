require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const os = require('os');

const app = express();
// Ensure models (and DB initialization) starts as early as possible so /api/health
// can report DB readiness. This module exports `mongoose` among other models.
const { mongoose } = require('./models');

// Middleware
app.use(cors());
app.use(express.json());

// Request timing middleware — log slow requests for profiling
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const ms = Date.now() - start;
    // Only log requests that take longer than 150ms to keep logs useful
    if (ms > 150) {
      console.log(`[slow] ${req.method} ${req.originalUrl} ${res.statusCode} - ${ms}ms`);
    }
  });
  next();
});

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/garbage', require('./routes/garbage'));
app.use('/api/routes', require('./routes/routes'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/notifications', require('./routes/notifications'));

// Health check (includes DB readiness)
app.get('/api/health', (req, res) => {
  const readyState = (mongoose && mongoose.connection) ? mongoose.connection.readyState : 0;
  const dbMode = (mongoose && mongoose.dbMode) ? mongoose.dbMode : 'unknown';
  const dbConnected = readyState === 1;
  res.json({ status: dbConnected ? 'ok' : 'degraded', time: new Date().toISOString(), db: { connected: dbConnected, readyState, mode: dbMode } });
});

// Serve static frontend in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
  });
}

const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || '0.0.0.0';

app.listen(PORT, HOST, () => {
  console.log(`🚀 Server running on ${HOST}:${PORT}`);
  const interfaces = os.networkInterfaces();
  Object.values(interfaces)
    .flat()
    .filter((entry) => entry && entry.family === 'IPv4' && !entry.internal)
    .forEach((entry) => {
      console.log(`📱 LAN URL: http://${entry.address}:${PORT}/api/health`);
    });
});
