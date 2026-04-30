const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const mongoose = require('mongoose');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('checkdatabase')
    .setDescription('Kiểm tra kết nối database')
    .setNameLocalizations({
      'vi': 'checkdatabase',
    })
    .setDescriptionLocalizations({
      'vi': 'Kiểm tra kết nối database',
    })
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  category: 'admin',

  async execute(interaction) {
    const mongoUri = process.env.MONGODB_URL;
    
    if (!mongoUri) {
      const embed = new EmbedBuilder()
        .setColor(0xff0000)
        .setTitle('❌ Lỗi Kết Nối')
        .setDescription('Chưa cấu hình MONGODB_URL trong file .env')
        .setTimestamp();
      await interaction.reply({ embeds: [embed], ephemeral: true });
      return;
    }

    try {
      // Kiểm tra trạng thái kết nối
      const start = Date.now();
      await mongoose.connection.db.command({ ping: 1 });
      const latency = Date.now() - start;

      // Lấy thông tin database
      const dbState = mongoose.connection.readyState;
      const states = {
        0: '❌ Chưa kết nối',
        1: '🟢 Đã kết nối',
        2: '🟡 Đang kết nối',
        3: '🔴 Lỗi kết nối',
      };

      const embed = new EmbedBuilder()
        .setColor(dbState === 1 ? 0x00ff00 : 0xff0000)
        .setTitle('📊 Kiểm Tra Database')
        .setDescription(dbState === 1 ? '✅ Database đang hoạt động!' : '❌ Database không hoạt động')
        .addFields(
          { name: '📌 Trạng thái', value: states[dbState] || 'Không xác định', inline: true },
          { name: '⚡ Độ trễ', value: `${latency}ms`, inline: true },
          { name: '📛 Tên database', value: mongoose.connection.name || 'Không có', inline: true },
          { name: '🔗 Host', value: mongoose.connection.host || 'Không có', inline: true }
        )
        .setTimestamp();

      await interaction.reply({ embeds: [embed], ephemeral: true });
    } catch (error) {
      const embed = new EmbedBuilder()
        .setColor(0xff0000)
        .setTitle('❌ Lỗi Kết Nối')
        .setDescription(`Lỗi: ${error.message}`)
        .setTimestamp();
      await interaction.reply({ embeds: [embed], ephemeral: true });
    }
  },
};
