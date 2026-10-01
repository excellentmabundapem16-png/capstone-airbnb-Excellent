process.env.MONGOMS_DOWNLOAD_DIR = '/home/user/airbnb-clone/server/data/mongod-bin';
process.env.MONGOMS_DB_PATH = '/home/user/airbnb-clone/server/data/mongo';
const { MongoMemoryServer } = require('mongodb-memory-server');
(async () => {
  const t = Date.now();
  const srv = await MongoMemoryServer.create({ instance: { dbName: 'airbnb', storageEngine: 'wiredTiger' } });
  console.log('URI:', srv.getUri(), 'in', ((Date.now()-t)/1000).toFixed(1), 's');
  const mongoose = require('mongoose');
  await mongoose.connect(srv.getUri());
  await mongoose.connection.db.collection('t').insertOne({ ok: 1 });
  console.log('doc:', await mongoose.connection.db.collection('t').findOne({}));
  await mongoose.disconnect();
  await srv.stop();
  console.log('OK');
})().catch(e => { console.error('FAIL', e.message); process.exit(1); });
