# 🤖 Kostin Bot V2

Bot Discord với Slash Commands, viết bằng Node.js.

## 📦 Cài đặt

```bash
npm install
```

## ⚙️ Cấu hình

1. Điền thông tin vào file `.env`:
   - `DISCORD_TOKEN`: Bot Token từ [Discord Developer Portal](https://discord.com/developers/applications)
   - `CLIENT_ID`: Application ID
   - `GUILD_ID`: Server ID cần test

2. Cách lấy thông tin:
   - **Token**: Applications → Bot → Reset Token
   - **Client ID**: Applications → General Information
   - **Guild ID**: Bật Developer Mode trong Discord → Click chuột phải vào server → Copy ID

## 🚀 Chạy bot

```bash
# Deploy commands (chạy 1 lần khi thêm/sửa command)
npm run deploy

# Chạy bot
npm start
```

## 📁 Cấu trúc

```
KostinBotV2/
├── src/
│   ├── commands/     # Slash commands
│   │   ├── ping.js
│   │   └── info.js
│   ├── index.js      # Main bot file
│   └── deploy-commands.js  # Deploy commands
├── .env              # Configuration
├── package.json
└── README.md
```

## ➕ Thêm command mới

Tạo file mới trong `src/commands/`:

```javascript
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ten_command')
    .setDescription('Mô tả command'),

  async execute(interaction) {
    // Xử lý command
    await interaction.reply('Hello!');
  },
};
```

Sau đó chạy `npm run deploy` để đăng ký command mới.

## 📝 Commands có sẵn

- `/ping` - Kiểm tra độ trễ
- `/info` - Thông tin bot

---
Made with ❤️