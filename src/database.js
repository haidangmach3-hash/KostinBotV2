const mongoose = require('mongoose');
require('dotenv').config();

// Console styling
const styles = {
  reset: '\x1b[0m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
};

const log = {
  info: (text) => console.log(`  ${styles.cyan}›${styles.reset} ${text}`),
  success: (text) => console.log(`  ${styles.green}✓${styles.reset} ${text}`),
  error: (text) => console.log(`  ${styles.red}✕${styles.reset} ${text}`),
};

// Schema cho các lệnh admin (kick, ban)
const AdminActionSchema = new mongoose.Schema({
  type: { type: String, enum: ['kick', 'ban'], required: true },
  userId: { type: String, required: true },
  userTag: { type: String, required: true },
  moderatorId: { type: String, required: true },
  moderatorTag: { type: String, required: true },
  reason: { type: String, default: 'Không có lý do' },
  timestamp: { type: Date, default: Date.now },
  guildId: { type: String, required: true },
  guildName: { type: String, required: true },
});

// Schema cho cấu hình server
const GuildConfigSchema = new mongoose.Schema({
  guildId: { type: String, required: true, unique: true },
  guildName: { type: String, required: true },
  prefix: { type: String, default: '!' },
  logChannelId: { type: String, default: null },
  welcomeChannelId: { type: String, default: null },
  welcomeMessage: { type: String, default: null },
  autoRoleId: { type: String, default: null },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Schema cho user data
const UserDataSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  guildId: { type: String, required: true },
  xp: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
  money: { type: Number, default: 0 },
  joinCount: { type: Number, default: 1 },
  lastMessage: { type: Date, default: null },
  warnCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Tạo compound unique index
UserDataSchema.index({ userId: 1, guildId: 1 }, { unique: true });

// Tạo models
const AdminAction = mongoose.model('AdminAction', AdminActionSchema);
const GuildConfig = mongoose.model('GuildConfig', GuildConfigSchema);
const UserData = mongoose.model('UserData', UserDataSchema);

// Kết nối MongoDB
async function connectDB() {
  const mongoUri = process.env.MONGODB_URL;
  
  if (!mongoUri) {
    log.error('MONGODB_URL chưa được cấu hình trong .env');
    return false;
  }

  try {
    await mongoose.connect(mongoUri);
    log.success('Đã kết nối MongoDB');
    return true;
  } catch (error) {
    log.error(`Lỗi kết nối MongoDB: ${error.message}`);
    return false;
  }
}

// Hàm ghi lại hành động admin (kick, ban)
async function logAdminAction(action) {
  try {
    const newAction = new AdminAction(action);
    await newAction.save();
    return newAction;
  } catch (error) {
    console.error('Lỗi ghi admin action:', error);
    return null;
  }
}

// Hàm lấy cấu hình server
async function getGuildConfig(guildId, guildName) {
  try {
    let config = await GuildConfig.findOne({ guildId });
    if (!config) {
      config = new GuildConfig({ guildId, guildName });
      await config.save();
    }
    return config;
  } catch (error) {
    console.error('Lỗi lấy guild config:', error);
    return null;
  }
}

// Hàm cập nhật cấu hình server
async function updateGuildConfig(guildId, updates) {
  try {
    const config = await GuildConfig.findOneAndUpdate(
      { guildId },
      { ...updates, updatedAt: Date.now() },
      { new: true, upsert: true }
    );
    return config;
  } catch (error) {
    console.error('Lỗi cập nhật guild config:', error);
    return null;
  }
}

// Hàm lấy hoặc tạo user data
async function getUserData(userId, guildId) {
  try {
    let userData = await UserData.findOne({ userId, guildId });
    if (!userData) {
      userData = new UserData({ userId, guildId });
      await userData.save();
    }
    return userData;
  } catch (error) {
    console.error('Lỗi lấy user data:', error);
    return null;
  }
}

// Hàm cập nhật user data
async function updateUserData(userId, guildId, updates) {
  try {
    const userData = await UserData.findOneAndUpdate(
      { userId, guildId },
      { ...updates, updatedAt: Date.now() },
      { new: true, upsert: true }
    );
    return userData;
  } catch (error) {
    console.error('Lỗi cập nhật user data:', error);
    return null;
  }
}

// Hàm lấy leaderboard
async function getLeaderboard(guildId, sortBy = 'xp', limit = 10) {
  try {
    const leaderboard = await UserData.find({ guildId })
      .sort({ [sortBy]: -1 })
      .limit(limit);
    return leaderboard;
  } catch (error) {
    console.error('Lỗi lấy leaderboard:', error);
    return [];
  }
}

// Ngắt kết nối
async function disconnectDB() {
  await mongoose.disconnect();
  log.info('Đã ngắt kết nối MongoDB');
}

module.exports = {
  connectDB,
  disconnectDB,
  logAdminAction,
  getGuildConfig,
  updateGuildConfig,
  getUserData,
  updateUserData,
  getLeaderboard,
  AdminAction,
  GuildConfig,
  UserData,
};
