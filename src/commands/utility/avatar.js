// filepath: src/commands/utility/avatar.js
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('avatar')
    .setDescription('Lấy avatar của một người dùng')
    .setNameLocalizations({
      'vi': 'avatar',
    })
    .setDescriptionLocalizations({
      'vi': 'Lấy avatar của một người dùng',
    })
    .addUserOption(option =>
      option.setName('user')
        .setDescription('Người dùng cần lấy avatar (để trống là bạn)')
    ),

  category: 'utility',

  async execute(interaction) {
    const user = interaction.options.getUser('user') || interaction.user;
    const avatarUrl = user.displayAvatarURL({ size: 4096, dynamic: true });

    await interaction.reply({ content: `${user.tag}'s avatar:`, ephemeral: true });
    await interaction.followUp(avatarUrl);
  },
};