// filepath: src/commands/utility/serverinfo.js
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('serverinfo')
    .setDescription('Xem thông tin server')
    .setNameLocalizations({
      'vi': 'serverinfo',
    })
    .setDescriptionLocalizations({
      'vi': 'Xem thông tin server',
    }),

  category: 'utility',

  async execute(interaction) {
    const guild = interaction.guild;
    const embed = new EmbedBuilder()
      .setColor(0x5865F2)
      .setTitle(`📋 ${guild.name}`)
      .setThumbnail(guild.iconURL())
      .addFields(
        { name: '🆔 ID', value: guild.id, inline: true },
        { name: '👤 Owner', value: `<@${guild.ownerId}>`, inline: true },
        { name: '📅 Tạo ngày', value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:D>`, inline: true },
        { name: '👥 Thành viên', value: `${guild.memberCount}`, inline: true },
        { name: '💬 Channels', value: `${guild.channels.cache.size}`, inline: true },
        { name: '🎭 Roles', value: `${guild.roles.cache.size}`, inline: true }
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed], ephemeral: true });
  },
};