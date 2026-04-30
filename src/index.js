// filepath: src/index.js
const { Client, GatewayIntentBits, Collection, Events } = require('discord.js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();
const { connectDB } = require('./database');

// Console styling
const styles = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  italic: '\x1b[3m',
  underline: '\x1b[4m',
  
  // Colors
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  white: '\x1b[37m',
  gray: '\x1b[90m',
  
  // Background
  bgCyan: '\x1b[46m',
  bgBlue: '\x1b[44m',
};

// Custom console functions
const log = {
  title: (text) => console.log(`\n${styles.bright}${styles.cyan}▀▀▀ ${text} ▀▀▀${styles.reset}`),
  info: (text) => console.log(`  ${styles.gray}›${styles.reset} ${text}`),
  success: (text) => console.log(`  ${styles.green}✓${styles.reset} ${text}`),
  warn: (text) => console.log(`  ${styles.yellow}⚠${styles.reset} ${text}`),
  error: (text) => console.log(`  ${styles.red}✕${styles.reset} ${text}`),
  cmd: (text) => console.log(`  ${styles.magenta}↳${styles.reset} ${styles.dim}${text}${styles.reset}`),
  line: () => console.log(styles.gray + '  ─────────────────────────────────────' + styles.reset),
};

// Tạo client với intents cần thiết
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

// Lưu trữ commands
client.commands = new Collection();

// Load tất cả commands từ folder commands (bao gồm subfolders)
function loadCommands() {
  const commandsPath = path.join(__dirname, 'commands');
  let count = 0;
  
  // Hàm đệ quy để load commands từ folder và subfolders
  function loadFromDirectory(dirPath, category = '') {
    const items = fs.readdirSync(dirPath);
    
    for (const item of items) {
      const itemPath = path.join(dirPath, item);
      const stat = fs.statSync(itemPath);
      
      if (stat.isDirectory()) {
        loadFromDirectory(itemPath, item);
      } else if (item.endsWith('.js')) {
        const command = require(itemPath);
        
        if ('data' in command && 'execute' in command) {
          if (category) {
            command.category = category;
          }
          client.commands.set(command.data.name, command);
          log.cmd(`/${command.data.name}${category ? ` [${category}]` : ''}`);
          count++;
        } else {
          log.warn(`Command ${item} missing "data" or "execute"`);
        }
      }
    }
  }
  
  log.title('LOADING COMMANDS');
  loadFromDirectory(commandsPath);
  log.success(`${count} commands loaded`);
}

// Xử lý slash command
client.on(Events.InteractionCreate, async (interaction) => {
  // Xử lý button interactions
  if (interaction.isButton()) {
    const customId = interaction.customId;
    
    // Tìm command có handleButton
    for (const [name, command] of client.commands) {
      if (command.handleButton) {
        const embed = command.handleButton(interaction, customId);
        if (embed) {
          await interaction.update({ embeds: [embed], components: [] });
          return;
        }
      }
    }
    return;
  }

  // Xử lý select menu interactions
  if (interaction.isStringSelectMenu()) {
    const customId = interaction.customId;
    
    // Tìm command có handleSelectMenu
    for (const [name, command] of client.commands) {
      if (command.handleSelectMenu) {
        const embed = command.handleSelectMenu(interaction);
        if (embed) {
          await interaction.update({ embeds: [embed], components: [] });
          return;
        }
      }
    }
    return;
  }

  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);

  if (!command) {
    log.error(`Command not found: ${interaction.commandName}`);
    return;
  }

  try {
    await command.execute(interaction);
  } catch (error) {
    log.error(`Execute error: ${error.message}`);
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({ content: '❌ Có lỗi xảy ra khi thực thi lệnh!', flags: 64 });
    } else {
      await interaction.reply({ content: '❌ Có lỗi xảy ra khi thực thi lệnh!', flags: 64 });
    }
  }
});

// Xử lý khi bot ready
client.on(Events.ClientReady, (c) => {
  log.line();
  log.title('BOT ONLINE');
  log.info(`Logged in as ${styles.bright}${c.user.username}${styles.reset}`);
  log.info(`${styles.cyan}${c.guilds.cache.size}${styles.reset} server(s) connected`);
  log.line();
});

// Xử lý khi bot bị lỗi
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

// Khởi động bot
async function startBot() {
  log.title('STARTING BOT');
  
  // Kết nối MongoDB
  await connectDB();
  
  loadCommands();
  log.line();
  client.login(process.env.DISCORD_TOKEN);
}

startBot();
