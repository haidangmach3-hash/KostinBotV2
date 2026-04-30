// filepath: src/deploy-commands.js
const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Console styling
const styles = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  magenta: '\x1b[35m',
  gray: '\x1b[90m',
};

const log = {
  title: (text) => console.log(`\n${styles.bright}${styles.cyan}▀▀▀ ${text} ▀▀▀${styles.reset}`),
  info: (text) => console.log(`  ${styles.gray}›${styles.reset} ${text}`),
  success: (text) => console.log(`  ${styles.green}✓${styles.reset} ${text}`),
  warn: (text) => console.log(`  ${styles.yellow}⚠${styles.reset} ${text}`),
  error: (text) => console.log(`  ${styles.red}✕${styles.reset} ${text}`),
  cmd: (text) => console.log(`  ${styles.magenta}↳${styles.reset} ${styles.dim}${text}${styles.reset}`),
  line: () => console.log(styles.gray + '  ─────────────────────────────────────' + styles.reset),
};

const commands = [];
const commandsPath = path.join(__dirname, 'commands');

// Load all commands (bao gồm subfolders)
function loadAllCommands(dirPath, category = '') {
  const items = fs.readdirSync(dirPath);
  
  for (const item of items) {
    const itemPath = path.join(dirPath, item);
    const stat = fs.statSync(itemPath);
    
    if (stat.isDirectory()) {
      loadAllCommands(itemPath, item);
    } else if (item.endsWith('.js')) {
      const command = require(itemPath);
      
      if ('data' in command && 'execute' in command) {
        commands.push(command.data.toJSON());
        log.cmd(`/${command.data.name}`);
      } else {
        log.warn(`Command ${item} missing "data" or "execute"`);
      }
    }
  }
}

log.title('DEPLOYING COMMANDS');
loadAllCommands(commandsPath);
log.success(`${commands.length} commands found`);

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

const isGlobal = process.argv.includes('global');

(async () => {
  try {
    log.info(`Deploying ${styles.bright}${commands.length}${styles.reset} commands...`);
    log.line();

    let route;
    if (isGlobal) {
      route = Routes.applicationCommands(process.env.CLIENT_ID);
      log.info(`${styles.cyan}Global${styles.reset} commands (may take up to 1 hour)`);
    } else {
      route = Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID);
      log.info(`${styles.cyan}Guild${styles.reset} commands (instant update)`);
    }

    const data = await rest.put(route, { body: commands });

    log.line();
    log.success(`${data.length} commands deployed`);
    log.title('DEPLOY COMPLETE');
  } catch (error) {
    log.line();
    log.error(`Deploy failed: ${error.message}`);
  }
})();