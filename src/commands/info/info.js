// filepath: src/commands/info/info.js
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('info')
    .setDescription('Thông tin về bot')
    .setNameLocalizations({
      'vi': 'info',
    })
    .setDescriptionLocalizations({
      'vi': 'Thông tin về bot',
    }),

  category: 'info',

  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setColor(0x5865F2)
      .setTitle('🤖 Kostin Bot V2')
      .setDescription('Bot Discord với Slash Commands')
      .addFields(
        { name: '📌 Phiên bản', value: '1.0.0', inline: true },
        { name: '⚙️ Node.js', value: process.version, inline: true },
        { name: '📊 Server', value: `${interaction.client.guilds.cache.size}`, inline: true }
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed], ephemeral: true });
  },
};