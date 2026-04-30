// filepath: src/commands/info/help.js
const { 
  SlashCommandBuilder, 
  EmbedBuilder, 
  ActionRowBuilder, 
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder
} = require('discord.js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Xem danh sách tất cả commands')
    .setNameLocalizations({
      'vi': 'help',
    })
    .setDescriptionLocalizations({
      'vi': 'Xem danh sách tất cả commands',
    }),

  category: 'info',

  async execute(interaction) {
    const commandsPath = path.join(__dirname, '..');
    const categories = this.loadCategories(commandsPath);
    const bannerUrl = process.env.BANNER_URL || null;
    
    // Tạo embed chính đẹp với banner
    const mainEmbed = new EmbedBuilder()
      .setColor(0x6366F1)
      .setAuthor({
        name: '✨ Kostin Bot V2',
        iconURL: interaction.client.user.displayAvatarURL()
      })
      .setTitle('📚 Danh Sách Commands')
      .setDescription('Chọn **category** bên dưới để xem chi tiết các lệnh\n\n' + 
        categories.map(cat => `**${cat.emoji} ${cat.name}** - \`${cat.commands.length} commands\``).join('\n'))
      .setThumbnail(interaction.client.user.displayAvatarURL())
      .addFields(
        { name: '📊 Tổng cộng', value: `${categories.reduce((sum, cat) => sum + cat.commands.length, 0)} commands`, inline: true },
        { name: '📁 Categories', value: `${categories.length} categories`, inline: true }
      )
      .setFooter({ 
        text: '💡 Tip: Sử dụng /command để chạy lệnh • Click bên dưới để xem chi tiết',
        iconURL: interaction.client.user.displayAvatarURL()
      })
      .setTimestamp();

    // Thêm banner nếu có
    if (bannerUrl) {
      mainEmbed.setImage(bannerUrl);
    }

    // Tạo select menu cho categories
    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId('help_category')
      .setPlaceholder('📋 Chọn category...')
      .addOptions(
        categories.map(cat => 
          new StringSelectMenuOptionBuilder()
            .setLabel(`${cat.emoji} ${cat.name}`)
            .setDescription(`${cat.commands.length} commands • ${cat.description}`)
            .setValue(cat.id)
        )
      );

    const row = new ActionRowBuilder().addComponents(selectMenu);

    // ephemeral: true - chỉ người dùng nhìn thấy
    await interaction.reply({ embeds: [mainEmbed], components: [row], ephemeral: true });
  },

  // Load categories tự động
  loadCategories(commandsPath) {
    const categories = [];
    const categoryDirs = fs.readdirSync(commandsPath).filter(item => {
      return fs.statSync(path.join(commandsPath, item)).isDirectory();
    });

    const categoryInfo = {
      admin: { emoji: '🛡️', name: 'Admin', color: 'DC2626', description: 'Quản lý server' },
      info: { emoji: 'ℹ️', name: 'Info', color: '4F46E5', description: 'Thông tin bot' },
      utility: { emoji: '🔧', name: 'Utility', color: '059669', description: 'Tiện ích' },
      meme: { emoji: '🎮', name: 'Meme', color: 'D97706', description: 'Giải trí' },
    };

    for (const dir of categoryDirs) {
      const dirPath = path.join(commandsPath, dir);
      const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.js'));
      const commands = [];

      for (const file of files) {
        try {
          const command = require(path.join(dirPath, file));
          if (command.data && command.data.name) {
            commands.push({
              name: command.data.name,
              description: command.data.description,
            });
          }
        } catch (e) {
          // Bỏ qua lỗi
        }
      }

      if (commands.length > 0) {
        const info = categoryInfo[dir] || { emoji: '📁', name: dir, color: '6B7280', description: 'Commands' };
        categories.push({
          id: dir,
          emoji: info.emoji,
          name: info.name,
          color: info.color,
          description: info.description,
          commands: commands
        });
      }
    }

    return categories;
  },

  // Xử lý select menu
  handleSelectMenu(interaction) {
    const categoryId = interaction.values[0];
    const commandsPath = path.join(__dirname, '..');
    const categories = this.loadCategories(commandsPath);
    const category = categories.find(c => c.id === categoryId);
    const bannerUrl = process.env.BANNER_URL || null;

    if (!category) return null;

    // Chuyển đổi hex color sang số
    const colorValue = parseInt(category.color, 16);

    const embed = new EmbedBuilder()
      .setColor(colorValue)
      .setAuthor({
        name: `${category.emoji} ${category.name} Commands`,
        iconURL: interaction.client.user.displayAvatarURL()
      })
      .setTitle(`${category.emoji} ${category.name} Commands`)
      .setDescription(`**Danh sách commands trong category ${category.name}:**\n`)
      .addFields(
        category.commands.map(cmd => ({
          name: `/${cmd.name}`,
          value: cmd.description || 'Không có mô tả',
          inline: false
        }))
      )
      .setFooter({ 
        text: '💡 Sử dụng /tên_command để chạy',
        iconURL: interaction.client.user.displayAvatarURL()
      })
      .setTimestamp();

    // Thêm banner nếu có
    if (bannerUrl) {
      embed.setImage(bannerUrl);
    }

    return embed;
  }
};