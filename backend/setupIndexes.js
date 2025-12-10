const mongoose = require('mongoose');
const { setupIndexes } = require('./config/indexSetup');

require('dotenv').config();

async function main() {
  try {
    console.log('🚀 Starting database index setup...\n');

    console.log('Connecting to MongoDB...');
    mongoose.set("strictQuery", false);
    await mongoose.connect(process.env.DataBaseURL);
    console.log('Connected to MongoDB:', mongoose.connection.host);
    console.log('');

    // Setup indexes
    await setupIndexes();

    // Disconnect
    await mongoose.connection.close();
    console.log('\Database connection closed');
    console.log('✨ Index setup completed successfully!');
    process.exit(0);

  } catch (error) {
    console.error('\nError during index setup:', error.message);
    await mongoose.connection.close();
    process.exit(1);
  }
}

main();
