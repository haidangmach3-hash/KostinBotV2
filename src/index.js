// filepath: src/index.js
const { Client, GatewayIntentBits, Collection, Events } = require('discord.js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// ═══════════════════════════════════════════════════════════════
// 🎨 ADVANCED CONSOLE STYLING
// ═══════════════════════════════════════════════════════════════

const styles = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  italic: '\x1b[3m',
  underline: '\x1b[4m',
  blink: '\x1b[5m',
  
  // Text Colors
  black: '\x1b[30m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  gray: '\x1b[90m',
  brightRed: '\x1b[91m',
  brightGreen: '\x1b[92m',
  brightYellow: '\x1b[93m',
  brightBlue: '\x1b[94m',
  brightMagenta: '\x1b[95m',
  brightCyan: '\x1b[96m',
  
  // Background Colors
  bgBlack: '\x1b[40m',
  bgRed: '\x1b[41m',
  bgGreen: '\x1b[42m',
  bgYellow: '\x1b[43m',
  bgBlue: '\x1b[44m',
  bgMagenta: '\x1b[45m',
  bgCyan: '\x1b[46m',
  bgWhite: '\x1b[47m',
};

// ═══════════════════════════════════════════════════════════════
// 🎌 ASCII ART BANNER
// ═══════════════════════════════════════════════════════════════

const asciiArt = {
  logo: `
${styles.cyan}    ██╗   ${styles.magenta}██╗ ${styles.blue}███████╗ ${styles.green}██████╗  ${styles.yellow}███████╗ ${styles.red}██████╗  ${styles.cyan}██╗   ${styles.magenta}██╗
${styles.cyan}    ██║   ${styles.magenta}██║ ${styles.blue}██╔════╝ ${styles.green}██╔══██╗ ${styles.yellow}██╔═══██╗${styles.red}██╔══██╗ ${styles.cyan}██║   ${styles.magenta}██║
${styles.cyan}    ██║   ${styles.magenta}██║ ${styles.blue}█████╗   ${styles.green}██████╔╝ ${styles.yellow}██║   ██║${styles.red}██████╔╝ ${styles.cyan}██║   ${styles.magenta}██║
${styles.cyan}    ╚██╗ ██╔╝ ${styles.blue}██╔══╝   ${styles.green}██╔══██╗ ${styles.yellow}██║   ██║${styles.red}██╔══██╗ ${styles.cyan}╚██╗ ██╔╝
${styles.cyan}     ╚████╔╝  ${styles.blue}███████╗ ${styles.green}██║  ██║ ${styles.yellow}╚██████╔╝${styles.red}██║  ██║ ${styles.cyan} ╚████╔╝
${styles.cyan}      ╚═══╝   ${styles.blue}╚══════╝ ${styles.green}╚═╝  ╚═╝ ${styles.yellow} ╚═════╝ ${styles.red} ╚═╝  ╚═╝ ${styles.cyan}  ╚═══╝${styles.reset}
`,
  bot: `
${styles.bright}${styles.cyan}██████╗ ██╗██████╗ ████████╗██████╗ ██╗  ██╗██╗   ██╗███████╗
${styles.cyan}██╔══██╗██║██╔══██╗╚══██╔══╝██╔══██╗██║  ██║██║   ██║██╔════╝
${styles.blue}██████╔╝██║██████╔╝   ██║   ██████╔╝███████║██║   ██║█████╗  
${styles.blue}██╔═══╝ ██║██╔══██╗   ██║   ██╔══██╗██╔══██║██║   ██║██╔══╝  
${styles.magenta}██║     ██║██║  ██║   ██║   ██║  ██║██║  ██║╚██████╔╝███████╗
${styles.magenta}╚═╝     ╚═╝╚═╝  ╚═╝   ╚═╝   ╚═╝  ╚═╝╚═╝  ╚═╝ ╚═════╝ ╚══════╝${styles.reset}
`,
  deploy: `
${styles.bright}${styles.green}╔═══════════════════════════════════════════════════════════════════╗
${styles.green}║  ██████╗ ██████╗ ████████╗██████╗ ██╗  ██╗██╗   ██╗███████╗  ║
${styles.green}║ ██╔═══██╗██╔══██╗╚══██╔══╝██╔══██╗██║  ██║██║   ██║██╔════╝  ║
${styles.green}║ ██║   ██║██████╔╝   ██║   ██████╔╝███████║██║   ██║█████╗    ║
${styles.green}║ ██║   ██║██╔══██╗   ██║   ██╔══██╗██╔══██║██║   ██║██╔══╝    ║
${styles.green}║ ╚██████╔╝██║  ██║   ██║   ██║  ██║██║  ██║╚██████╔╝███████╗  ║
${styles.green}║  ╚═════╝ ╚═╝  ╚═╝   ╚═╝   ╚═╝  ╚═╝╚═╝  ╚═╝ ╚═════╝ ╚══════╝  ║
${styles.green}╚═══════════════════════════════════════════════════════════════════╝${styles.reset}
`
};

// ═══════════════════════════════════════════════════════════════
// 🚀 CUSTOM CONSOLE LOG FUNCTIONS
// ═══════════════════════════════════════════════════════════════

const getTime = () => {
  const now = new Date();
  return `${styles.gray}${now.toLocaleTimeString('vi-VN')}${styles.reset}`;
};

// Gradient effect for text
const gradient = (text, color1, color2) => {
  let result = '';
  const len = text.length;
  for (let i = 0; i < len; i++) {
    const ratio = i / len;
    result += ratio < 0.5 ? color1 : color2;
    result += text[i];
  }
  return result + styles.reset;
};

const log = {
  // Big banner title
  title: (text) => {
    const border = styles.bright + styles.cyan + '═'.repeat(20) + styles.reset;
    console.log(`\n${border}`);
    console.log(`${styles.bright}${styles.cyan}  ${text}${styles.reset}`);
    console.log(`${border}`);
  },
  
  // Gradient title
  gradientTitle: (text) => {
    console.log(`\n${gradient(text, styles.cyan, styles.magenta)}`);
  },
  
  // Info message
  info: (text) => {
    console.log(`  ${styles.gray}├${styles.reset} ${styles.cyan}›${styles.reset} ${text}`);
  },
  
  // Success message with checkmark
  success: (text) => {
    console.log(`  ${styles.gray}├${styles.reset} ${styles.green}✓${styles.reset} ${styles.bright}${styles.green}${text}${styles.reset}`);
  },
  
  // Warning message
  warn: (text) => {
    console.log(`  ${styles.gray}├${styles.reset} ${styles.yellow}⚠${styles.reset} ${styles.yellow}${text}${styles.reset}`);
  },
  
  // Error message
  error: (text) => {
    console.log(`  ${styles.gray}├${styles.reset} ${styles.red}✕${styles.reset} ${styles.bright}${styles.red}${text}${styles.reset}`);
  },
  
  // Command loaded
  cmd: (text) => {
    console.log(`  ${styles.gray}├${styles.reset} ${styles.magenta}↳${styles.reset} ${styles.dim}${text}${styles.reset}`);
  },
  
  // Debug message
  debug: (text) => {
    console.log(`  ${styles.gray}├${styles.reset} ${styles.gray}›${styles.reset} ${styles.dim}${text}${styles.reset}`);
  },
  
  // Separator line
  line: () => {
    console.log(styles.gray + '  ├' + '─'.repeat(35) + styles.reset);
  },
  
  // Box with content (fixed for negative values)
  box: (title, content, color = styles.cyan) => {
    try {
      const titleLen = (title || '').length;
      const maxContentLen = content.reduce((max, line) => Math.max(max, (line || '').length), 0);
      const maxLen = Math.max(titleLen, maxContentLen);
      const boxWidth = Math.min(Math.max(maxLen + 2, 32), 50);
      
      const safeRepeat = (char, count) => {
        if (count < 0) count = 0;
        return char.repeat(count);
      };
      
      const safeSpace = (count) => {
        if (count < 0) count = 0;
        return ' '.repeat(count);
      };
      
      console.log(`\n${color}╔${safeRepeat('═', boxWidth)}╗${styles.reset}`);
      console.log(`${color}║${styles.reset} ${styles.bright}${color}${title}${styles.reset}${safeSpace(boxWidth - titleLen)}${color}║${styles.reset}`);
      console.log(`${color}╠${safeRepeat('═', boxWidth)}╣${styles.reset}`);
      
      content.forEach((line, i) => {
        const sep = i === content.length - 1 ? '╚' : '║';
        const lineLen = (line || '').length;
        const padding = Math.max(boxWidth - lineLen, 1);
        console.log(`${color}${sep}${styles.reset} ${line}${safeSpace(padding)}${color}${sep}${styles.reset}`);
      });
      
      console.log(`${color}╚${safeRepeat('═', boxWidth)}╝${styles.reset}`);
    } catch (e) {
      // Fallback if box rendering fails
      console.log(`\n[ ${title} ]`);
      content.forEach(line => console.log(`  ${line}`));
    }
  },
  
  // Loading animation
  loading: (text) => {
    const frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
    let frame = 0;
    const interval = setInterval(() => {
      process.stdout.write(`\r${styles.cyan}${frames[frame]}${styles.reset} ${text} ${styles.gray}${'●'.repeat(frame + 1)}${'○'.repeat(9 - frame)}${styles.reset}`);
      frame = (frame + 1) % 10;
    }, 100);
    return () => clearInterval(interval);
  },
  
  // Section header
  section: (text) => {
    console.log(`\n${styles.bright}${styles.yellow}▀▀▀ ${text} ▀▀▀${styles.reset}`);
  },
};

// ═══════════════════════════════════════════════════════════════
// 🤖 CLIENT SETUP
// ═══════════════════════════════════════════════════════════════

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
  presence: {
    activities: [{
      name: '🎮 Chơi game',
      type: 0,
    }],
    status: 'online',
  },
});

client.commands = new Collection();

let startTime = Date.now();

// ═════════════════════════════════════════════════════════════
// 📂 LOAD COMMANDS
// ═════════════════════════════════════════════════════════════

function loadCommands() {
  const commandsPath = path.join(__dirname, 'commands');
  let count = 0;
  const categories = {};
  
  // Recursive load from folders
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
            if (!categories[category]) categories[category] = [];
            categories[category].push(command.data.name);
          }
          client.commands.set(command.data.name, command);
          log.cmd(`/${command.data.name}${category ? ` ${styles.gray}[${category}]${styles.reset}` : ''}`);
          count++;
        } else {
          log.warn(`Command ${item} missing "data" or "execute"`);
        }
      }
    }
  }
  
  log.gradientTitle('LOADING COMMANDS');
  log.info(`${styles.gray}Loading from:${styles.reset} ${commandsPath}`);
  log.line();
  loadFromDirectory(commandsPath);
  log.line();
  log.success(`${count} commands loaded`);
  
  // Show categories summary
  const categoryCount = Object.keys(categories).length;
  if (categoryCount > 0) {
    log.info(`${categoryCount} categories: ${Object.keys(categories).join(', ')}`);
  }
  
  return count;
}

// ═════════════════════════════════════════════════════════════
// ⚡ INTERACTION HANDLER
// ═════════════════════════════════════════════════════════════

client.on(Events.InteractionCreate, async (interaction) => {
  // Handle button interactions
  if (interaction.isButton()) {
    const customId = interaction.customId;
    
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

  // Handle select menu interactions
  if (interaction.isStringSelectMenu()) {
    const customId = interaction.customId;
    
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

// ═════════════════════════════════════════════════════════════════════
// 🎯 BOT READY
// ═════════════════════════════════════════════════════════════

// Biến toàn cục lưu interval của loading animation  
let globalConnectStop = null;
// Export ra bên ngoài để có thể gán được
globalThis.connectStopRef = (fn) => { globalConnectStop = fn; };

client.on(Events.ClientReady, (c) => {
  // Dừng loading animation nếu đang chạy
  if (globalConnectStop) {
    globalConnectStop();
    globalConnectStop = null;
  }
  
  const uptime = Date.now() - startTime;
  const seconds = Math.floor(uptime / 1000);
  
  log.line();
  log.gradientTitle('🤖 BOT ONLINE');
  log.info(`${styles.gray}Logged in as:${styles.reset} ${styles.bright}${styles.green}${c.user.username}${styles.reset}`);
  log.info(`${styles.gray}Bot ID:${styles.reset} ${c.user.id}`);
  log.info(`${styles.gray}Servers:${styles.reset} ${styles.cyan}${c.guilds.cache.size}${styles.reset}`);
  log.info(`${styles.gray}Commands:${styles.reset} ${styles.magenta}${client.commands.size}${styles.reset}`);
  log.line();
  
  // Nice box with bot info
  log.box('BOT STATS', [
    `${styles.gray}Status:${styles.reset} ${styles.green}Online${styles.reset}`,
    `${styles.gray}Uptime:${styles.reset} ${styles.cyan}${seconds}s${styles.reset}`,
  ], styles.green);
  
  log.success(`${styles.bright}Bot is ready to serve!${styles.reset}`);
  log.line();
});

process.on('unhandledRejection', (reason, promise) => {
  console.error(`${styles.red}❌ Unhandled Rejection:${styles.reset}`, reason);
});

process.on('uncaughtException', (error) => {
  console.error(`${styles.red}❌ Uncaught Exception:${styles.reset}`, error);
  process.exit(1);
});

// ═════════════════════════════════════════════════════════════
// 🚀 START BOT
// ═════════════════════════════════════════════════════════════

// Show ASCII art logo
console.log(asciiArt.logo);
log.line();

// Version info với gradient
log.gradientTitle('🚀 STARTING KOSTIN BOT V2');
log.info(`${styles.gray}Version:${styles.reset} ${styles.cyan}Kostin${styles.reset}`);

// Connect to MongoDB (async)
(async () => {
  const { connectDB } = require('./database');
  const dbConnected = await connectDB();
  if (dbConnected) {
    log.success(`Database connected ${styles.green}✓${styles.reset}`);
  } else {
    log.warn(`Database connection failed - some features may not work`);
  }
})();
log.info(`${styles.gray}Node.js:${styles.reset} ${styles.green}${process.version}${styles.reset}`);
log.info(`${styles.gray}Platform:${styles.reset} ${styles.yellow}${process.platform}${styles.reset}`);
log.line();

// Loading animation cho commands
const loadStop = log.loading('Loading commands');
const commandCount = loadCommands();
loadStop();
log.line();

log.info(`${styles.gray}Connecting to Discord...${styles.reset}`);
const connectStop = log.loading('Authenticating');
// Lưu interval để dừng khi bot ready
globalThis.connectStopRef(connectStop);
client.login(process.env.DISCORD_TOKEN);
