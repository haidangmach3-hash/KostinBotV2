const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { AdminAction } = require('../../database');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('adminlogs')
    .setDescription('Xem lịch sử admin actions (kick/ban)')
    .setNameLocalizations({
      'vi': 'adminlogs',
    })
    .setDescriptionLocalizations({
      'vi': 'Xem lịch sử admin actions (kick/ban)',
    })
    .addIntegerOption(option =>
      option.setName('limit')
        .setDescription('Số lượng bản ghi cần xem (mặc định: 10)')
        .setMinValue(1)
        .setMaxValue(50)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  category: 'admin',

  async execute(interaction) {
    const limit = interaction.options.getInteger('limit') || 10;
    const guildId = interaction.guild.id;

    try {
      const logs = await AdminAction.find({ guildId })
        .sort({ timestamp: -1 })
        .limit(limit);

      if (!logs || logs.length === 0) {
        const embed = new EmbedBuilder()
          .setColor(0x808080)
          .setTitle('📋 Admin Logs')
          .setDescription('Chưa có admin action nào!')
          .setTimestamp();
        await interaction.reply({ embeds: [embed], ephemeral: true });
        return;
      }

      const embed = new EmbedBuilder()
        .setColor(0x7289da)
        .setTitle('📋 Admin Logs')
        .setDescription(`Danh sách ${logs.length} action gần nhất:`)
        .setTimestamp();

      for (const log of logs) {
        const actionType = log.type;
        const typeEmoji = actionType === 'ban' ? '🔨' : '👢';
        
        embed.addFields({
          name: `${typeEmoji} ${actionType.toUpperCase()} - ${log.userTag}`,
          value: `**Lý do:** ${log.reason}\n**Người thực hiện:** ${log.moderatorTag}\n**Thời gian:** <t:${Math.floor(log.timestamp.getTime() / 1000)}:R>`,
          inline: false
        });
      }

      await interaction.reply({ embeds: [embed], ephemeral: true });
    } catch (error) {
      console.error('Lỗi lấy admin logs:', error);
      const embed = new EmbedBuilder()
        .setColor(0xff0000)
        .setTitle('❌ Lỗi')
        .setDescription('Không thể lấy admin logs!')
        .setTimestamp();
      await interaction.reply({ embeds: [embed], ephemeral: true });
    }
  },
};
