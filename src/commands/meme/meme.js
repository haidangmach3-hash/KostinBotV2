// filepath: src/commands/meme/meme.js
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('meme')
    .setDescription('Random meme vui vẻ')
    .setNameLocalizations({
      'vi': 'meme',
    })
    .setDescriptionLocalizations({
      'vi': 'Random meme vui vẻ',
    })
    .addStringOption(option =>
      option.setName('type')
        .setDescription('Loại meme')
        .setChoices(
          { name: '😂 Random', value: 'random' },
          { name: '🐸 Frog', value: 'frog' },
          { name: '😹 Cat', value: 'cat' }
        )
    ),

  category: 'meme',

  async execute(interaction) {
    const memes = [
      'https://i.imgflip.com/1bij.jpg',
      'https://i.imgflip.com/1ur9b0.jpg',
      'https://i.imgflip.com/9ehk.jpg',
      'https://i.imgflip.com/1g8my4.jpg',
      'https://i.imgflip.com/26am.jpg',
    ];

    const randomMeme = memes[Math.floor(Math.random() * memes.length)];
    
    await interaction.reply({ content: `🎲 Random meme:\n${randomMeme}`, ephemeral: true });
  },
};