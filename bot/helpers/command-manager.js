// Imports
const fs = require(`fs`);
const path = require(`path`);
// const database = require(`../helpers/database-manager`);

// Exports
module.exports = {setSlashCommands, getAll, getAllSecret, reloadAll, clearAll, reloadOne, loadAll};

// Top level vars
const commandIDs = new Map();
const commandImports = new Map();
const secretCommandImports = new Map();

// Exported Functions
async function setSlashCommands(client) {
  console.info(`Generating slash commands...`);

  const slashCommands = [];
  const commandModules = getAll();

  for (const command of commandModules.keys()) {
    const helpInfo = commandModules.get(command).getHelp();
    if (helpInfo) {
      if (helpInfo.level === `user`) {
        slashCommands.push({name: command, description: helpInfo.text, options: helpInfo.options, type: helpInfo.type, dm_permission: helpInfo.allowDM});
      } else {
        slashCommands.push({name: command, description: helpInfo.text, options: helpInfo.options, type: helpInfo.type, dm_permission: helpInfo.allowDM, default_member_permissions: 0});
      }
    }
  }

  console.info(`Done generating commands, setting...`);

  await client.application.commands.set(slashCommands);

  console.info(`Done setting commands.`);
}

function getAll() {
  return commandImports;
}

function getAllSecret() {
  return secretCommandImports;
}

function reloadAll() {
  clearAll();

  console.info(`Unloaded commands...`);

  loadAll();
}

function clearAll() {
  for (const command of commandImports.keys()) {
    delete require.cache[require.resolve(`../commands/${command}.js`)];
  }

  for (const command of secretCommandImports.keys()) {
    delete require.cache[require.resolve(`../commands/secret/${command}.js`)];
  }

  commandIDs.clear();
  commandImports.clear();
  secretCommandImports.clear();
}

function reloadOne(command) {
  const commands = fs.readdirSync(`./bot/commands`, {withFileTypes: true}).filter(file => file.isFile()).map(file => file.name);
  const secretCommands = fs.readdirSync(`./bot/commands/secret`);

  if (commands.includes(`${command}.js`)) {
    delete require.cache[require.resolve(`../commands/${command}.js`)];

    commandImports.delete(command);
    commandImports.set(command, require(`../commands/${command}.js`));

    console.info(`Reloaded command: ${command}`);
  } else if (secretCommands.includes(`${command}.js`)) {
    delete require.cache[require.resolve(`../commands/secret/${command}.js`)];

    secretCommandImports.delete(command);
    secretCommandImports.set(command, require(`../commands/secret/${command}.js`));

    console.info(`Reloaded command: ${command}`);
  } else {
    console.info(`No command found for: ${command}`);
  }
}

function loadAll() {
  const commands = fs.readdirSync(`./bot/commands`, {withFileTypes: true}).filter(file => file.isFile()).map(file => file.name);
  const secretCommands = fs.readdirSync(`./bot/commands/secret`);

  for (let i = 0; i < commands.length; i++) {
    const commandName = path.basename(commands[i], `.js`);

    commandImports.set(commandName, require(`../commands/${commands[i]}`));

    console.info(`Loaded command: ${commandName}`);
  }

  for (let i = 0; i < secretCommands.length; i++) {
    const commandName = path.basename(secretCommands[i], `.js`);

    secretCommandImports.set(commandName, require(`../commands/secret/${secretCommands[i]}`));

    console.info(`Loaded command: ${commandName}`);
  }
}
