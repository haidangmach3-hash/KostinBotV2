const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const mongoose = require('mongoose');
require('dotenv').config();

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
    
    // Hiển thị đang kiểm tra
    await interaction.deferReply();

    if (!mongoUri) {
      const embed = new EmbedBuilder()
        .setColor(0xff0000)
        .setTitle('❌ Lỗi Kết Nối')
        .setDescription('Chưa cấu hình **MONGODB_URL** trong file `.env`')
        .setFooter({ text: '💡 Liên hệ admin để cấu hình database' })
        .setTimestamp();
      await interaction.editReply({ embeds: [embed] });
      return;
    }

    try {
      // Kiểm tra trạng thái kết nối với ping
      const start = Date.now();
      await mongoose.connection.db.command({ ping: 1 });
      const latency = Date.now() - start;

      // Lấy thông tin database
      const dbState = mongoose.connection.readyState;
      const states = {
        0: { emoji: '❌', text: 'Chưa kết nối', color: 0xff0000 },
        1: { emoji: '🟢', text: 'Đã kết nối', color: 0x00ff00 },
        2: { emoji: '🟡', text: 'Đang kết nối', color: 0xffaa00 },
        3: { emoji: '🔴', text: 'Lỗi kết nối', color: 0xff0000 },
      };

      const stateInfo = states[dbState] || states[0];

      // Lấy thông tin chi tiết hơn
      let dbStats = { ok: 0 };
      try {
        dbStats = await mongoose.connection.db.command({ dbStats: 1 });
      } catch (e) {
        // Ignore - có thể không có quyền
      }

      // Lấy danh sách collections
      let collections = [];
      try {
        collections = await mongoose.connection.db.listCollections().toArray();
      } catch (e) {
        // Ignore
      }

      // Tính toán kích thước database
      const totalSize = dbStats.dataSize || 0;
      const totalSizeFormatted = totalSize > 1024 * 1024 * 1024 
        ? `${(totalSize / (1024 * 1024 * 1024)).toFixed(2)} GB`
        : totalSize > 1024 * 1024 
          ? `${(totalSize / (1024 * 1024)).toFixed(2)} MB`
          : `${(totalSize / 1024).toFixed(2)} KB`;

      // Lấy thông tin from .env
      let hostInfo = mongoose.connection.host || 'Unknown';
      try {
        // Parse host từ URI
        const uriParts = mongoUri.split('@');
        if (uriParts.length > 1) {
          hostInfo = uriParts[1].split('/')[0];
        }
      } catch (e) {
        // Use default
      }

      // Embed chính
      const embed = new EmbedBuilder()
        .setColor(stateInfo.color)
        .setAuthor({
          name: '📊 Database Status',
          iconURL: interaction.client.user.displayAvatarURL()
        })
        .setTitle(`${stateInfo.emoji} Database Status`)
        .setDescription(dbState === 1 
          ? '✅ **Database đang hoạt động tốt!**' 
          : '❌ **Database không hoạt động!**')
        .addFields(
          { name: '📌 Trạng thái', value: stateInfo.text, inline: true },
          { name: '⚡ Độ trễ', value: `${latency}ms`, inline: true },
          { name: '💾 Kích thước', value: totalSizeFormatted, inline: true },
          { name: '🗄️ Collections', value: `${collections.length} collections`, inline: true },
          { name: '🔗 Host', value: hostInfo, inline: true },
          { name: '📛 Database', value: mongoose.connection.name || 'kostin_db', inline: true }
        )
        .setFooter({ 
          text: `🤖 Kostin Bot V2 | Kiểm tra lúc ${new Date().toLocaleTimeString('vi-VN')}`,
          iconURL: interaction.client.user.displayAvatarURL()
        })
        .setTimestamp();

      // Nếu có collections, thêm vào embed
      if (collections.length > 0) {
        const collectionNames = collections.map(c => c.name).join(', ');
        embed.addFields({ 
          name: '📁 Danh sách Collections', 
          value: collectionNames.substring(0, 1024), 
          inline: false 
        });
      }

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      const embed = new EmbedBuilder()
        .setColor(0xff0000)
        .setTitle('❌ Lỗi Kết Nối')
        .setDescription(`**Lỗi:** ${error.message}`)
        .addFields(
          { name: '💡 Gợi ý', value: 'Kiểm tra lại MONGODB_URL trong file .env', inline: false }
        )
        .setFooter({ text: '🤖 Kostin Bot V2' })
        .setTimestamp();
      await interaction.editReply({ embeds: [embed] });
    }
  },
};
