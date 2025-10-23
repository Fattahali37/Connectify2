const ProfileFeature = require('../models/ProfileFeature');

function computeFeaturesFromUserDoc(user) {
  if (!user) return null;
  const features = {
    user: user._id,
    // dataset fields
    'profile pic': user.avatar ? 1 : 0,
    'nums/length username': Math.min(1, (user.username ? user.username.length : 0) / 30),
    'fullname words': user.name ? user.name.trim().split(/\s+/).filter(Boolean).length : 0,
    'nums/length fullname': Math.min(1, (user.name ? user.name.replace(/\s+/g, '').length : 0) / 30),
    'name==username': user.name ? (user.name.split(" ").join("").toLowerCase() === (user.username || '').toLowerCase() ? 1 : 0) : 0,
    'description length': user.bio ? user.bio.length : 0,
    'external URL': user.website && user.website.trim().length > 0 ? 1 : 0,
    'private': user.private ? 1 : 0,
    '#posts': Array.isArray(user.posts) ? user.posts.length : 0,
    '#followers': Array.isArray(user.followers) ? user.followers.length : 0,
  '#following': Array.isArray(user.followings) ? user.followings.length : 0,
    'fake': 0,
  };
  return features;
}

async function computeFeaturesForUserId(userId) {
  if (!userId) return null;
  // require User dynamically to avoid circular dependency when this helper is required by User model
  const User = require('../models/User');
  const user = await User.findOne({ _id: userId }).lean();
  if (!user) return null;
  const features = computeFeaturesFromUserDoc(user);
  const res = await ProfileFeature.findOneAndUpdate(
    { user: user._id },
    { $set: features },
    { upsert: true, new: true }
  );
  return res;
}

async function upsertFeaturesFromUserDoc(userDoc) {
  const features = computeFeaturesFromUserDoc(userDoc);
  if (!features) return null;
  const res = await ProfileFeature.findOneAndUpdate(
    { user: userDoc._id },
    { $set: features },
    { upsert: true, new: true }
  );
  return res;
}

module.exports = { computeFeaturesForUserId, computeFeaturesFromUserDoc, upsertFeaturesFromUserDoc };
