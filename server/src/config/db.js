import mongoose from 'mongoose';
import dotenv from 'dotenv';
import dns from 'dns';

dotenv.config();

// Fix Windows DNS SRV lookup issues for mongodb+srv:// URIs
try {
  dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
  console.log('🌐 Configured Google/Cloudflare public DNS servers for Atlas SRV resolution');
} catch (dnsErr) {
  console.warn('⚠️ Could not set custom DNS servers:', dnsErr.message);
}

export async function connectDB() {
  const mongoURI = process.env.MONGODB_URI;

  const mongooseOpts = {
    family: 4, // Force IPv4 to prevent Windows localhost/DNS IPv6 ECONNREFUSED issues
    serverSelectionTimeoutMS: 10000,
    connectTimeoutMS: 10000
  };

  // Tier 1: Try primary MONGODB_URI (MongoDB Atlas)
  if (mongoURI) {
    try {
      console.log('🔄 Connecting to MongoDB Atlas...');
      await mongoose.connect(mongoURI, mongooseOpts);
      console.log('✅ Successfully connected to MongoDB Atlas');
      return;
    } catch (error) {
      console.error('⚠️ Primary MongoDB Atlas Connection Failed:', error.message);
      console.log('💡 Note: Ensure your current IP is whitelisted in MongoDB Atlas Network Access (0.0.0.0/0).');
    }
  }

  // Tier 2: Try Local MongoDB instance if running
  try {
    const localURI = 'mongodb://127.0.0.1:27017/fittrack';
    console.log('🔄 Attempting connection to local MongoDB (mongodb://127.0.0.1:27017/fittrack)...');
    await mongoose.connect(localURI, { ...mongooseOpts, serverSelectionTimeoutMS: 3000 });
    console.log('✅ Connected to Local MongoDB server');
    return;
  } catch (localErr) {
    console.log('ℹ️ Local MongoDB service not detected on port 27017');
  }

  // Tier 3: In-Memory MongoDB Server fallback
  try {
    console.log('🔄 Initializing In-Memory MongoDB Server fallback...');
    const { MongoMemoryServer } = await import('mongodb-memory-server');
    const mongod = await MongoMemoryServer.create({
      instance: { dbName: 'fittrack' },
      binary: { version: '6.0.6' }
    });
    const memoryUri = mongod.getUri();
    await mongoose.connect(memoryUri);
    console.log('✅ Successfully connected to In-Memory MongoDB Instance:', memoryUri);
  } catch (fallbackError) {
    console.error('❌ All MongoDB Connection Tiers Failed!');
    console.error('Details:', fallbackError.message);
    console.error('\n🛠️ Troubleshooting Steps:');
    console.error('1. Whitelist your current IP address (or 0.0.0.0/0) in MongoDB Atlas Security -> Network Access.');
    console.error('2. Check database username/password in server/.env');
  }
}
