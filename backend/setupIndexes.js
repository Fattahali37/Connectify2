/**
 * Database Index Setup Script
 * 
 * This script creates optimized indexes on MongoDB collections
 * for faster query performance.
 * 
 * Usage:
 *   node setupIndexes.js
 * 
 * Important: Run this once after setting up the database
 */

const mongoose = require('mongoose');
const { setupIndexes } = require('./config/indexSetup');

// Load environment variables the same way as server.js
require('dotenv').config();

async function main() {
  try {
    console.log('🚀 Starting database index setup...\n');

    // Connect to MongoDB using the same method as db.js
    console.log('📡 Connecting to MongoDB...');
    mongoose.set("strictQuery", false);
    await mongoose.connect(process.env.DataBaseURL);
    console.log('✅ Connected to MongoDB:', mongoose.connection.host);
    console.log('');

    // Setup indexes
    await setupIndexes();

    // Disconnect
    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');
    console.log('✨ Index setup completed successfully!');
    process.exit(0);

  } catch (error) {
    console.error('\n❌ Error during index setup:', error.message);
    await mongoose.connection.close();
    process.exit(1);
  }
}

main();
