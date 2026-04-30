const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { logAdminAction } = require('../../database');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ban')
    .setDescription('Ban một thành viên khỏi server')
    .setNameLocalizations({
      'vi': 'ban',
    })
    .setDescriptionLocalizations({
      'vi': 'Ban một thành viên khỏi server',
    })
    .addUserOption(option =>
      option.setName('user')
        .setDescription('Người dùng cần ban')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('Lý do ban')
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

  category: 'admin',

  async execute(interaction) {
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

    if (!member.bannable) {
      const embed = new EmbedBuilder()
        .setColor(0xff0000)
        .setTitle('❌ Lỗi')
        .setDescription('Bot không có quyền ban người này!')
        .setTimestamp();
      await interaction.reply({ embeds: [embed], ephemeral: true });
      return;
    }

    // Tạo embed xác nhận
    const confirmEmbed = new EmbedBuilder()
      .setColor(0xffa500)
      .setTitle('⚠️ Xác Nhận Ban')
      .setDescription(`Bạn có chắc chắn muốn ban **${user.tag}** không?`)
      .addFields(
        { name: '👤 Người bị ban', value: `${user.tag} (${user.id})`, inline: true },
        { name: '📝 Lý do', value: reason, inline: true }
      )
      .setThumbnail(user.displayAvatarURL({ dynamic: true }))
      .setTimestamp();

    // Tạo nút xác nhận và hủy
    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('ban_confirm')
          .setLabel('✅ Xác Nhận')
          .setStyle(ButtonStyle.Danger)
          .setEmoji('✓'),
        new ButtonBuilder()
          .setCustomId('ban_cancel')
          .setLabel('❌ Hủy')
          .setStyle(ButtonStyle.Secondary)
          .setEmoji('✕')
      );

    await interaction.reply({ embeds: [confirmEmbed], components: [row], ephemeral: true });
  },

  // Xử lý khi bấm nút
  async handleButton(interaction, customId) {
    if (customId === 'ban_confirm' || customId === 'ban_cancel') {
      // Lấy thông tin từ message gốc
      const userId = interaction.message.embeds[0]?.fields?.find(f => f.name === '👤 Người bị ban')?.value?.match(/\((.+)\)/)?.[1];
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

      if (customId === 'ban_cancel') {
        const embed = new EmbedBuilder()
          .setColor(0x808080)
          .setTitle('ℹ️ Đã Hủy')
          .setDescription(`Đã hủy ban **${user?.tag || 'người dùng này'}**`)
          .setTimestamp();
        await interaction.update({ embeds: [embed], components: [] });
        return null;
      }

      // Thực hiện ban
      if (member && member.bannable) {
        await member.ban({ reason });

        // Ghi vào database
        await logAdminAction({
          type: 'ban',
          userId: userId,
          userTag: user?.tag || userId,
          moderatorId: interaction.user.id,
          moderatorTag: interaction.user.tag,
          reason: reason,
          guildId: interaction.guild.id,
          guildName: interaction.guild.name,
        });

        // Gửi DM cho người bị ban
        try {
          const dmEmbed = new EmbedBuilder()
            .setColor(0xff0000)
            .setTitle('⚠️ Bạn Đã Bị Ban Khỏi Server')
            .setDescription(`Bạn đã bị ban khỏi server **${interaction.guild.name}**`)
            .addFields(
              { name: '📝 Lý do', value: reason },
              { name: '👤 Người ban', value: interaction.user.tag }
            )
            .setTimestamp();
          await user?.send({ embeds: [dmEmbed] }).catch(() => {});
        } catch (e) {
          // Ignored - có thể người dùng chặn DM
        }

        // Embed thông báo thành công
        const successEmbed = new EmbedBuilder()
          .setColor(0x00ff00)
          .setTitle('✅ Ban Thành Công')
          .setDescription(`Đã ban **${user?.tag || userId}** khỏi server!`)
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
          .setDescription('Không thể ban người này!')
          .setTimestamp();
        await interaction.update({ embeds: [embed], components: [] });
        return null;
      }
    }
    return null;
  },
};
