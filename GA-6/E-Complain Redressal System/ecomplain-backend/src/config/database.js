const mongoose = require('mongoose');

// Cache the connection to reuse
let cachedConnection = null;

const connectDB = async () => {
  try {
    // If connection already exists and is ready, reuse it
    if (cachedConnection && mongoose.connection.readyState === 1) {
      console.log('✅ Using existing MongoDB connection');
      return cachedConnection;
    }

    // Configure Mongoose buffering options
    mongoose.set('bufferCommands', false);

    const options = {
      maxPoolSize: 50,
      minPoolSize: 5,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000,
      family: 4, // Use IPv4
      retryWrites: true,
      retryReads: true,
    };

    const conn = await mongoose.connect(process.env.MONGODB_URI, options);

    // Cache the connection for reuse
    cachedConnection = conn;

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error('\n❌ Database connection error:', error.message);
    console.error('\n📋 Diagnostic Information:');
    console.error('   Connection String:', process.env.MONGODB_URI ?
      process.env.MONGODB_URI.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@') : 'NOT SET');

    // Provide helpful error messages for common issues
    if (error.message.includes('authentication failed') || error.message.includes('bad auth')) {
      console.error('\n💡 Authentication Error:');
      console.error('   1. Check your MongoDB username and password');
      console.error('   2. Verify database user exists and has proper permissions');
    } else if (error.message.includes('ENOTFOUND') || error.message.includes('getaddrinfo')) {
      console.error('\n💡 DNS/Network Error:');
      console.error('   1. Check your MongoDB connection string format');
      console.error('   2. Verify MongoDB is running');
      console.error('   3. Check internet connection');
    } else if (error.message.includes('ECONNREFUSED')) {
      console.error('\n💡 Connection Refused:');
      console.error('   1. Make sure MongoDB is installed and running locally');
      console.error('   2. Check if MongoDB service is started');
      console.error('   3. Verify port 27017 is not blocked');
    }

    console.error('\n🔍 Troubleshooting Steps:');
    console.error('   1. Make sure MongoDB is installed and running');
    console.error('   2. Verify MONGODB_URI in your .env file');
    console.error('   3. Check if MongoDB service is started: mongod or net start MongoDB');
    console.error('   4. Default connection string: mongodb://127.0.0.1:27017/ecomplain');
    console.error('');

    process.exit(1);
  }
};

// Handle connection events
mongoose.connection.on('connected', () => {
  console.log('✅ Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ Mongoose connection error:', err.message);
  cachedConnection = null;
});

mongoose.connection.on('disconnected', () => {
  console.log('⚠️  Mongoose disconnected');
  cachedConnection = null;
});

mongoose.connection.on('reconnected', () => {
  console.log('✅ Mongoose reconnected to MongoDB');
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  process.exit(0);
});

module.exports = connectDB;
