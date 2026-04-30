const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { logAdminAction } = require('../../database');

module.exports = {
  data: new SlashCommandBuilder()
.setName('kick')
    .setDescription('Kick một thành viên khỏi server')
    .setNameLocalizations({
      'vi': 'kick',
    })
    .setDescriptionLocalizations({
      'vi': 'Kick một thành viên khỏi server',
    })
    .addUserOption(option =>
      option.setName('user')
        .setDescription('Người dùng cần kick')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('Lý do kick')
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  category: 'admin',

  async execute(interaction) {
    // Kiểm tra quyền admin
    if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
      const embed = new EmbedBuilder()
        .setColor(0xff0000)
        .setTitle('❌ Không Có Quyền')
        .setDescription('Bạn cần quyền Administrator để sử dụng lệnh này!')
        .setTimestamp();
      await interaction.reply({ embeds: [embed], ephemeral: true });
      return;
    }

    const user = interaction.options.getUser('user');
    const reason = interaction.options.getString('reason') || 'Không có lý do';
    const member = interaction.guild.members.cache.get(user.id);

    if (!member) {
      const embed = new EmbedBuilder()
        .setColor(0xff0000)
        .setTitle('❌ Lỗi')
        .setDescription('Người dùng không tìm thấy trong server!')
        .setTimestamp();
      await interaction.reply({ embeds: [embed], ephemeral: true });
      return;
    }

    if (!member.kickable) {
      const embed = new EmbedBuilder()
        .setColor(0xff0000)
        .setTitle('❌ Lỗi')
        .setDescription('Bot không có quyền kick người này!')
        .setTimestamp();
      await interaction.reply({ embeds: [embed], ephemeral: true });
      return;
    }

    // Tạo embed xác nhận
    const confirmEmbed = new EmbedBuilder()
      .setColor(0xffa500)
      .setTitle('⚠️ Xác Nhận Kick')
      .setDescription(`Bạn có chắc chắn muốn kick **${user.tag}** không?`)
      .addFields(
        { name: '👤 Người bị kick', value: `${user.tag} (${user.id})`, inline: true },
        { name: '📝 Lý do', value: reason, inline: true }
      )
      .setThumbnail(user.displayAvatarURL({ dynamic: true }))
      .setTimestamp();

    // Tạo nút xác nhận và hủy
    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('kick_confirm')
          .setLabel('✅ Xác Nhận')
          .setStyle(ButtonStyle.Danger)
          .setEmoji('✓'),
        new ButtonBuilder()
          .setCustomId('kick_cancel')
          .setLabel('❌ Hủy')
          .setStyle(ButtonStyle.Secondary)
          .setEmoji('✕')
      );

    await interaction.reply({ embeds: [confirmEmbed], components: [row], ephemeral: true });
  },

  // Xử lý khi bấm nút
  async handleButton(interaction, customId) {
    if (customId === 'kick_confirm' || customId === 'kick_cancel') {
      // Lấy thông tin từ message gốc
      const userId = interaction.message.embeds[0]?.fields?.find(f => f.name === '👤 Người bị kick')?.value?.match(/\((.+)\)/)?.[1];
      const reason = interaction.message.embeds[0]?.fields?.find(f => f.name === '📝 Lý do')?.value || 'Không có lý do';

      if (!userId) {
        const embed = new EmbedBuilder()
          .setColor(0xff0000)
          .setTitle('❌ Lỗi')
          .setDescription('Không tìm thấy thông tin người dùng!')
          .setTimestamp();
        await interaction.update({ embeds: [embed], components: [] });
        return null;
      }

      const user = await interaction.client.users.fetch(userId).catch(() => null);
      const member = interaction.guild.members.cache.get(userId);

      if (customId === 'kick_cancel') {
        const embed = new EmbedBuilder()
          .setColor(0x808080)
          .setTitle('ℹ️ Đã Hủy')
          .setDescription(`Đã hủy kick **${user?.tag || 'người dùng này'}**`)
          .setTimestamp();
        await interaction.update({ embeds: [embed], components: [] });
        return null;
      }

// Thực hiện kick
      if (member && member.kickable) {
        await member.kick(reason);

        // Ghi vào database
        await logAdminAction({
          type: 'kick',
          userId: userId,
          userTag: user?.tag || userId,
          moderatorId: interaction.user.id,
          moderatorTag: interaction.user.tag,
          reason: reason,
          guildId: interaction.guild.id,
          guildName: interaction.guild.name,
        });

        // Gửi DM cho người bị kick
        try {
          const dmEmbed = new EmbedBuilder()
            .setColor(0xff0000)
            .setTitle('⚠️ Bạn Đã Bị Kick Khỏi Server')
            .setDescription(`Bạn đã bị kick khỏi server **${interaction.guild.name}**`)
            .addFields(
              { name: '📝 Lý do', value: reason },
              { name: '👤 Người kick', value: interaction.user.tag }
            )
            .setTimestamp();
          await user?.send({ embeds: [dmEmbed] }).catch(() => {});
        } catch (e) {
          // Ignored - có thể người dùng chặn DM
        }

        // Embed thông báo thành công
        const successEmbed = new EmbedBuilder()
          .setColor(0x00ff00)
          .setTitle('✅ Kick Thành Công')
          .setDescription(`Đã kick **${user?.tag || userId}** khỏi server!`)
          .addFields(
            { name: '📝 Lý do', value: reason },
            { name: '👤 Người thực hiện', value: interaction.user.tag }
          )
          .setThumbnail(user?.displayAvatarURL({ dynamic: true }))
          .setTimestamp();

        await interaction.update({ embeds: [successEmbed], components: [] });
        return null;
      } else {
        const embed = new EmbedBuilder()
          .setColor(0xff0000)
          .setTitle('❌ Lỗi')
          .setDescription('Không thể kick người này!')
          .setTimestamp();
        await interaction.update({ embeds: [embed], components: [] });
        return null;
      }
    }
    return null;
  },
};
