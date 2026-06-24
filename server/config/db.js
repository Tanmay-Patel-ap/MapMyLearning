const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    console.log('[DB] Connecting to MongoDB...');
    const uri = process.env.MONGODB_URI;
    console.log('[DB] MONGODB_URI:', uri ? 'loaded (check .env for details)' : 'not loaded - using fallback');

    if (!uri) {
      console.warn('[DB] No MONGODB_URI in environment. Auth features will be disabled.');
      console.warn('[DB] To enable auth, add MONGODB_URI to your .env file.');
      return;
    }

    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000
    });
    
    console.log(`[DB] MongoDB Connected: ${conn.connection.host}`);
    console.log('[DB] Connection state:', mongoose.connection.readyState);
    return conn;
  } catch (error) {
    console.error('[DB Warning] MongoDB connection failed - Auth features disabled');
    console.error('[DB] Error:', error.message);
    
    if (error.message?.includes('ENOTFOUND') || error.message?.includes('getaddrinfo')) {
      console.error('[DB] TIP: Check your MONGODB_URI hostname. Network unreachable.');
    } else if (error.message?.includes('Authentication failed') || error.message?.includes('bad auth')) {
      console.error('[DB] TIP: Wrong MongoDB username or password. Check credentials in .env');
    } else if (error.message?.includes('timed out') || error.message?.includes('timeout')) {
      console.error('[DB] TIP: Connection timed out. Check if your IP is whitelisted in MongoDB Atlas:');
      console.error('[DB]   -> Go to https://cloud.mongodb.com, find your cluster');
      console.error('[DB]   -> Under SECURITY > Network Access, add your current IP');
    }
    // Don't exit process, just warn
  }
};

module.exports = connectDB;
