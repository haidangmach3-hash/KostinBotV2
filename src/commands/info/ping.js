// filepath: src/commands/info/ping.js
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Kiểm tra độ trễ của bot')
    .setNameLocalizations({
      'vi': 'ping',
    })
    .setDescriptionLocalizations({
      'vi': 'Kiểm tra độ trễ của bot',
    }),

  category: 'info',

  async execute(interaction) {
    const ping = interaction.client.ws.ping;
    await interaction.reply({ content: `🏓 Pong! Độ trễ: \`${ping}ms\``, ephemeral: true });
  },
};