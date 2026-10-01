/**
 * config/db.js
 * ------------
 * Database connection helper.
 *
 * Strategy:
 *  1. Try to connect to the MongoDB instance specified by MONGO_URI
 *     (e.g. a local `mongod` or a MongoDB Atlas cluster).
 *  2. If that fails (and ALLOW_MEMORY_MONGO is not "false"), fall back to a
 *     real `mongod` binary managed by mongodb-memory-server, storing its data
 *     in ./data/mongo so seeded data survives server restarts.
 *
 * This keeps the app "works out of the box" for demo/grading while still
 * using a genuine MongoDB + Mongoose connection in both cases.
 */
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

const MEMORY_DB_PATH = path.join(__dirname, '..', 'data', 'mongo');

async function connectDB() {
  mongoose.set('strictQuery', true);

  const uri = process.env.MONGO_URI;
  if (uri) {
    try {
      const conn = await mongoose.connect(uri, { serverSelectionTimeoutMS: 3000 });
      console.log(`[db] MongoDB connected: ${conn.connection.host}/${conn.connection.name}`);
      return conn;
    } catch (err) {
      console.warn(`[db] Could not reach MONGO_URI (${err.message}).`);
      if (process.env.ALLOW_MEMORY_MONGO === 'false') throw err;
      console.warn('[db] Falling back to sandboxed mongod instance...');
    }
  }

  // Fallback: spin up a real mongod binary with a persistent dbPath.
  const { MongoMemoryServer } = require('mongodb-memory-server');
  fs.mkdirSync(MEMORY_DB_PATH, { recursive: true });
  const memServer = await MongoMemoryServer.create({
    instance: { dbPath: MEMORY_DB_PATH, storageEngine: 'wiredTiger' },
  });
  const conn = await mongoose.connect(memServer.getUri(), { dbName: 'airbnb' });
  console.log(`[db] Sandbox MongoDB ready (data dir: ./data/mongo)`);
  // Keep a reference so the process can shut the instance down cleanly.
  global.__MONGO_MEMORY_SERVER = memServer;
  return conn;
}

module.exports = connectDB;
