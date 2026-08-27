import mongoose from 'mongoose';
import dns from 'node:dns';

try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {
  // fallback silently
}

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  try {
    console.log('[Database] Connecting to MongoDB Atlas...');
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 4000,
    });
    console.log(`[Database] Connected to Atlas: ${conn.connection.host} (${conn.connection.name})`);
    return conn;
  } catch (error) {
    console.warn(`[Database Warning] Atlas connection unavailable (IP whitelist or network issue: ${error.message}).`);
    console.log('[Database] Starting high-performance local in-memory MongoDB instance for development...');

    try {
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      const mongod = await MongoMemoryServer.create();
      const memUri = mongod.getUri();
      const conn = await mongoose.connect(memUri);
      console.log(`[Database] In-memory MongoDB connected successfully at ${memUri}`);
      
      // Auto seed if running in-memory
      const { autoSeed } = await import('../seed/seedHelper.js');
      await autoSeed();
      
      return conn;
    } catch (memError) {
      console.error('[Database Error] Failed to initialize fallback database:', memError.message);
      process.exit(1);
    }
  }
};
