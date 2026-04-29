const mongoose = require('mongoose');
const dns = require('dns');

const applyDnsFallback = () => {
  const servers = process.env.MONGO_DNS_SERVERS
    ? process.env.MONGO_DNS_SERVERS.split(',').map((server) => server.trim()).filter(Boolean)
    : ['8.8.8.8', '1.1.1.1'];

  dns.setServers(servers);
  console.warn(`Using DNS servers for Atlas SRV lookup: ${servers.join(', ')}`);
};

const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI is not set');
    }

    const options = {
      serverSelectionTimeoutMS: 5000,
    };

    try {
      await mongoose.connect(process.env.MONGO_URI, options);
    } catch (err) {
      if (process.env.MONGO_URI.startsWith('mongodb+srv://') && err.code === 'ECONNREFUSED') {
        applyDnsFallback();
        await mongoose.connect(process.env.MONGO_URI, options);
      } else {
        throw err;
      }
    }

    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    throw err;
  }
};

module.exports = connectDB;
