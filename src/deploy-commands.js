// filepath: src/deploy-commands.js
const { REST, Routes } = require('discord.js');
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
};

// ═══════════════════════════════════════════════════════════════
// 🎌 ASCII ART BANNER
// ═══════════════════════════════════════════════════════════════

const asciiArt = {
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
  
  // Separator line
  line: () => {
    console.log(styles.gray + '  ├' + '─'.repeat(35) + styles.reset);
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
      console.log(`\n[ ${title} ]`);
      content.forEach(line => console.log(`  ${line}`));
    }
  },
  
  // Big banner title
  title: (text) => {
    const border = '═'.repeat(20);
    console.log(`\n${styles.bright}${styles.cyan}${border}${styles.reset}`);
    console.log(`${styles.bright}${styles.cyan}  ${text}${styles.reset}`);
    console.log(`${styles.bright}${styles.cyan}${border}${styles.reset}`);
  },
};

const commands = [];
const commandsPath = path.join(__dirname, 'commands');
const categories = {};

// Load all commands (bao gồm subfolders)
function loadAllCommands(dirPath, category = '') {
  const items = fs.readdirSync(dirPath);
  
  for (const item of items) {
    const itemPath = path.join(dirPath, item);
    const stat = fs.statSync(itemPath);
    
    if (stat.isDirectory()) {
      loadAllCommands(itemPath, item);
      if (!categories[item]) categories[item] = 0;
    } else if (item.endsWith('.js')) {
      const command = require(itemPath);
      
      if ('data' in command && 'execute' in command) {
        commands.push(command.data.toJSON());
        
        if (category) {
          categories[category] = (categories[category] || 0) + 1;
        }
        
        log.cmd(`/${command.data.name}${category ? ` ${styles.gray}[${category}]${styles.reset}` : ''}`);
      } else {
        log.warn(`Command ${item} missing "data" or "execute"`);
      }
    }
  }
}

// Show ASCII art banner
console.log(asciiArt.deploy);
log.line();

log.gradientTitle('⚡ DEPLOYING COMMANDS');
log.info(`${styles.gray}Loading commands from:${styles.reset} ${commandsPath}`);
log.line();

loadAllCommands(commandsPath);

log.line();
log.success(`${commands.length} commands found`);

// Show categories
const categoryList = Object.entries(categories);
if (categoryList.length > 0) {
  log.info(`${styles.gray}Categories:${styles.reset}`);
  categoryList.forEach(([cat, count]) => {
    log.info(`  ${styles.cyan}•${styles.reset} ${cat}: ${styles.green}${count}${styles.reset}`);
  });
}

log.line();
log.info(`${styles.gray}Discord API:${styles.reset} ${styles.blue}v10${styles.reset}`);
log.info(`${styles.gray}Token:${styles.reset} ${styles.green}${process.env.DISCORD_TOKEN ? '✓ Configured' : '✕ Missing'}${styles.reset}`);

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
const isGlobal = process.argv.includes('global');

(function() {
  (async () => {
    try {
      log.line();
      log.info(`${styles.gray}Preparing to deploy...${styles.reset}`);
      log.info(`${styles.gray}Commands:${styles.reset} ${styles.bright}${commands.length}${styles.reset}`);
      
      let route, type;
      if (isGlobal) {
        route = Routes.applicationCommands(process.env.CLIENT_ID);
        type = 'Global';
        log.info(`${styles.gray}Type:${styles.reset} ${styles.magenta}${type}${styles.reset}`);
        log.warn(`${styles.yellow}⚠ Global commands may take up to 1 hour to update!${styles.reset}`);
      } else {
        route = Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID);
        type = 'Guild';
        log.info(`${styles.gray}Type:${styles.reset} ${styles.cyan}${type}${styles.reset}`);
        log.info(`${styles.gray}Guild ID:${styles.reset} ${styles.green}${process.env.GUILD_ID}${styles.reset}`);
      }
      
      log.line();
      
      // Loading animation
      const deployStop = log.loading('Deploying to Discord');
      const data = await rest.put(route, { body: commands });
      deployStop();
      
      log.line();
      log.success(`${data.length} commands deployed ${styles.green}✓${styles.reset}`);
      log.gradientTitle('🎉 DEPLOY COMPLETE');
      
      // Summary box
log.box('KOSTIN SUMMARY', [
        `${styles.gray}Total Commands:${styles.reset} ${styles.green}${data.length}${styles.reset}`,
        `${styles.gray}Type:${styles.reset} ${styles.cyan}${type}${styles.reset}`,
        `${styles.gray}Status:${styles.reset} ${styles.green}Success${styles.reset}`,
      ], styles.green);
      
    } catch (error) {
      log.line();
      log.error(`Deploy failed: ${error.message}`);
      if (error.code === 50001) {
        log.error('Missing access! Check bot permissions.');
      } else if (error.code === 50013) {
        log.error('Rate limited! Try again later.');
      }
    }
  })();
})();
