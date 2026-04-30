# 🤖 Kostin Bot V2

Bot Discord hiện đại với Slash Commands, viết bằng Node.js và Discord.js v14.

![Discord.js](https://img.shields.io/badge/Discord.js-v14.14.1-5865F2?style=for-the-badge&logo=discord)
![Node.js](https://img.shields.io/badge/Node.js-v16+-339933?style=for-the-badge&logo=node.js)
![License](https://img.shields.io/badge/License-MIT-FF6B6B?style=for-the-badge)

---

## 📦 Yêu cầu

- **Node.js**: Phiên bản 16.9.0 trở lên
- **npm**: Phiên bản mới nhất
- **MongoDB**: Database để lưu trữ logs admin (có thể dùng MongoDB Atlas miễn phí)

---

## ⚡ Cài đặt nhanh

```bash
# 1. Clone project và di chuyển vào thư mục
cd KostinBotV2

# 2. Cài đặt dependencies
npm install

# 3. Cấu hình bot (xem phần bên dưới)
# Tạo file .env và điền thông tin

# 4. Chạy bot
npm start
```

---

## ⚙️ Cấu hình

### Bước 1: Tạo file .env

Tạo file `.env` trong thư mục gốc của project với nội dung:

```env
# Bot Configuration
DISCORD_TOKEN=your_bot_token_here
CLIENT_ID=your_client_id_here
GUILD_ID=your_server_id_here

# Database (MongoDB)
MONGODB_URL=your_mongodb_connection_string
```

### Bước 2: Lấy thông tin từ Discord Developer Portal

| Thông tin | Cách lấy |
|----------|----------|
| **DISCORD_TOKEN** | Applications → Bot → Reset Token (hoặc Regenerate) |
| **CLIENT_ID** | Applications → General Information → Application ID |
| **GUILD_ID** | Settings (⚙️) → Advanced → Developer Mode = ON → Click chuột phải vào server name → Copy ID |

### Bước 3: Thiết lập MongoDB (Miễn phí)

1. Đăng ký [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register) miễn phí
2. Tạo cluster mới → Chọn region gần nhất (Singapore nếu ở Việt Nam)
3. Tạo database user (username/password)
4. Lấy connection string:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxx.mongodb.net/?retryWrites=true&w=majority
   ```
5. Thay vào `MONGODB_URL` trong file .env

### Bước 4: Invite Bot vào Server

Tạo OAuth2 URL:
```
https://discord.com/api/oauth2/authorize?client_id=YOUR_CLIENT_ID&permissions=8&scope=bot%20applications.commands
```

Copy và paste vào trình duyệt, chọn server và ấn Accept.

---

## 🚀 Cách chạy

### Chạy bot (Development)
```bash
npm start
# hoặc
npm run dev
```

### Deploy commands (Chạy 1 lần khi thêm/sửa command)
```bash
npm run deploy
```

### Deploy global commands (Tất cả servers)
```bash
npm run deploy-global
```

---

## 📁 Cấu trúc project

```
KostinBotV2/
├── src/
│   ├── index.js              # Main bot file
│   ├── database.js          # MongoDB connection & models
│   ├── deploy-commands.js   # Deploy slash commands
│   └── commands/
│       ├── admin/          # Commands quản trị
│       │   ├── ban.js     # Ban thành viên
│       │   ├── kick.js   # Kick thành viên
│       │   ├── logs.js   # Xem lịch sử admin
│       │   └── checkdatabase.js
│       ├── info/         # Commands thông tin
│       │   ├── ping.js   # Kiểm tra độ trễ
│       │   ├── info.js   # Thông tin bot
│       │   └── help.js  # Trợ giúp
│       ├── meme/         # Commands giải trí
│       │   └── meme.js
│       └── utility/     # Commands tiện ích
│           ├── avatar.js
│           └── serverinfo.js
├── emoji/              # Thư mục chứa emoji
├── img/                # Thư mục chứa hình ảnh
├── .env               # Cấu hình (KHÔNG commit)
├── package.json
└── README.md
```

---

## 📝 Danh sách Commands

### 🔧 Admin Commands

| Command | Mô tả |
|---------|-------|
| `/ban` | Ban thành viên khỏi server |
| `/kick` | Kick thành viên khỏi server |
| `/adminlogs` | Xem lịch sử kick/ban |

### ℹ️ Info Commands

| Command | Mô tả |
|---------|-------|
| `/ping` | Kiểm tra độ trễ của bot |
| `/info` | Xem thông tin bot |
| `/help` | Xem danh sách commands |

### 🎮 Meme Commands

| Command | Mô tả |
|---------|-------|
| `/meme` | Random meme vui |

### 🛠️ Utility Commands

| Command | Mô tả |
|---------|-------|
| `/avatar` | Lấy avatar của user |
| `/serverinfo` | Xem thông tin server |

---

## ➕ Thêm command mới

### Cách 1: Tạo command đơn giản

Tạo file mới trong `src/commands/<category>/<ten_command>.js`:

```javascript
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ten_command')
    .setDescription('Mô tả command')
    .setNameLocalizations({
      'vi': 'ten_command',
    })
    .setDescriptionLocalizations({
      'vi': 'Mô tả tiếng Việt',
    }),

  category: 'info',

  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setColor(0x5865F2)
      .setTitle('👋 Hello!')
      .setDescription('Đây là command mới!');

    await interaction.reply({ embeds: [embed] });
  },
};
```

### Cách 2: Command có options

```javascript
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ten_command')
    .setDescription('Mô tả')
    .addStringOption(option =>
      option.setName('input')
        .setDescription('Nhập gì đó')
        .setRequired(true)
    )
    .addIntegerOption(option =>
      option.setName('number')
        .setDescription('Nhập số')
        .setMinValue(1)
        .setMaxValue(100)
    ),

  async execute(interaction) {
    const input = interaction.options.getString('input');
    const number = interaction.options.getInteger('number');

    await interaction.reply(`Bạn nhập: ${input}, số: ${number}`);
  },
};
```

### Sau khi tạo command mới

```bash
# Deploy lại commands
npm run deploy
```

---

## 🎨 Tùy chỉnh

### Đổi tên bot
Sửa trong file `.env` hoặc trong [Discord Developer Portal](https://discord.com/developers/applications)

### Đổi màu sắc
Tìm các màu trong code:
- `0x5865F2` - Default Discord Blurple
- `0x00FF00` - Xanh lá
- `0xFF0000` - Đỏ
- `0xFFA500` - Cam
- `0x808080` - Xám

### Thêm emoji
Thêm emoji vào thư mục `emoji/` và sử dụng trong code.

---

## 🔧 Xử lý sự cố

### Bot không chạy

1. Kiểm tra `.env` đã điền đầy đủ chưa
2. Kiểm tra Token còn hiệu lực không
3. Chạy `node -c src/index.js` để kiểm tra lỗi syntax

### Commands không hiện

1. Chạy `npm run deploy` để deploy lại
2. Refresh Discord (Ctrl+Shift+R)

### Lỗi MongoDB

1. Kiểm tra `MONGODB_URL` trong `.env`
2. Kiểm tra username/password MongoDB Atlas
3. Kiểm tra network cho phép IP access (0.0.0.0/0)

---

## 📜 License

MIT License - Tự do sử dụng và chỉnh sửa.

---

**Developer Information**

Nhà phát triển : Laiiboi

Discord : laiiboi

Liên lạc: 0378098050

email: haidangmach3@gmail.com

facebook: https://www.facebook.com/machhaidang

**[END]**

```Thank you for using our service.```

---

video huong dẫn chạy bot 

``làm theo link dưới đây``
[video](https://streamable.com/46bq5i)

---
KostinBot được phát triển bởi Mạch Hải Đăng ❤️

Discord Bot
