const User = require('../models/User');
const Post = require('../models/Post');
const ProfileFeature = require('../models/ProfileFeature');
const ProfileVerification = require('../models/ProfileVerification');

/**
 * Setup database indexes for optimal query performance
 * Run this once after setting up the database
 */
async function setupIndexes() {
  try {
    console.log('🔧 Setting up database indexes...\n');

    // User indexes
    console.log('Creating User indexes...');
    await User.collection.createIndex({ username: 1 }, { unique: true });
    await User.collection.createIndex({ email: 1 }, { unique: true });
    await User.collection.createIndex({ status: 1 });
    await User.collection.createIndex({ private: 1 });
    await User.collection.createIndex({ verificationStatus: 1 });
    await User.collection.createIndex({ createdAt: -1 });
    await User.collection.createIndex({ 'followers': 1 });
    await User.collection.createIndex({ 'followings': 1 });
    console.log('✅ User indexes created\n');

    // Post indexes
    console.log('Creating Post indexes...');
    await Post.collection.createIndex({ owner: 1 });
    await Post.collection.createIndex({ createdAt: -1 });
    await Post.collection.createIndex({ owner: 1, createdAt: -1 });
    await Post.collection.createIndex({ 'likes': 1 });
    console.log('✅ Post indexes created\n');

    // ProfileFeature indexes
    console.log('Creating ProfileFeature indexes...');
    await ProfileFeature.collection.createIndex({ user: 1 }, { unique: true });
    console.log('✅ ProfileFeature indexes created\n');

    // ProfileVerification indexes
    console.log('Creating ProfileVerification indexes...');
    // userId already has a unique index, so skip it
    await ProfileVerification.collection.createIndex({ status: 1 });
    await ProfileVerification.collection.createIndex({ verifiedAt: -1 });
    console.log('✅ ProfileVerification indexes created\n');

    console.log('🎉 All indexes created successfully!');
    console.log('\n📊 Index Summary:');
    console.log('   User: 8 indexes');
    console.log('   Post: 4 indexes');
    console.log('   ProfileFeature: 1 index');
    console.log('   ProfileVerification: 3 indexes');
    console.log('\n✨ Database is now optimized for fast queries!');

  } catch (error) {
    console.error('❌ Error creating indexes:', error);
    throw error;
  }
}

module.exports = { setupIndexes };
