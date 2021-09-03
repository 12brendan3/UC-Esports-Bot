// Imports
const fs = require(`fs`);
const path = require(`path`);
const database = require(`../helpers/database-manager`);

// Exports
module.exports = {setSlashCommands, addRoleToGuildCommand, removeRoleFromGuildCommand, getAll, getAllSecret, reloadAll, clearAll, reloadOne, loadAll};

// Top level vars
const commandIDs = new Map();
const adminPermissions = new Map();
const devPermissions = [];
const permissionData = new Map();
const commandImports = new Map();
const secretCommandImports = new Map();

// Devs are hard-coded
const devs = new Set([`145730448105013248`, `151079705917915136`]);

// Exported Functions
async function setSlashCommands(client) {
  console.info(`Generating slash commands...`);

  const slashCommands = [];
  const commandModules = getAll();
  const devCommands = [];

  for (const command of commandModules.keys()) {
    const helpInfo = commandModules.get(command).getHelp();
    if (helpInfo) {
      if (helpInfo.level === `user`) {
        slashCommands.push({name: command, description: helpInfo.text, options: helpInfo.options});
      } else {
        slashCommands.push({name: command, description: helpInfo.text, options: helpInfo.options, defaultPermission: false});
      }

      if (helpInfo.level === `developer`) {
        devCommands.push(command);
      }
    }
  }

  console.info(`Done generating commands, setting...`);

  await client.application.commands.set(slashCommands);

  console.info(`Done setting commands, generating permissions...`);

  client.application.commands.cache.forEach((rawCommand, key) => {
    if (!rawCommand.defaultPermission) {
      commandIDs.set(rawCommand.name, key);
    }
  });

  devs.forEach(dev => {
    devPermissions.push({id: dev, type: `USER`, permission: true});
  });


  const allGuildSettings = await database.getAllEntries(`Guilds`);
  allGuildSettings.forEach((guildSettings) => {
    const rawGuild = client.guilds.cache.get(guildSettings.guildID);
    if (rawGuild) {
      const ownerPerm = {id: rawGuild.ownerId, type: `USER`, permission: true};
      if (guildSettings && guildSettings.adminRoleID && rawGuild.roles.cache.get(guildSettings.adminRoleID)) {
        const adminPerm = {id: guildSettings.adminRoleID, type: `ROLE`, permission: true};
        adminPermissions.set(rawGuild.id, devPermissions.concat(ownerPerm, adminPerm));
      } else {
        adminPermissions.set(rawGuild.id, devPermissions.concat(ownerPerm));
      }
    }
  });

  generatePermissions();

  console.info(`Done generating permissions, setting...`);

  const permSet = [];
  permissionData.forEach((commandPermissions, permGuildID) => {
    permSet.push(client.application.commands.permissions.set({guild: permGuildID, fullPermissions: commandPermissions}));
  });
  await Promise.all(permSet);

  console.info(`Done setting permissions.\nFinished loading slash commands!`);
}

async function addRoleToGuildCommand(client, guildID, roleID) {
  const adminPerm = {id: roleID, type: `ROLE`, permission: true};
  adminPermissions.set(guildID, adminPermissions.get(guildID).concat(adminPerm));

  generatePermissions();

  client.application.commands.permissions.set({guild: guildID, fullPermissions: permissionData.get(guildID)});
}

async function removeRoleFromGuildCommand(client, guildID, roleID) {
  adminPermissions.set(guildID, adminPermissions.get(guildID).filter(item => item.id !== roleID));

  generatePermissions();

  client.application.commands.permissions.set({guild: guildID, fullPermissions: permissionData.get(guildID)});
}

function generatePermissions() {
  const commandModules = getAll();

  commandIDs.forEach((commandID, commandName) => {
    if (commandModules.get(commandName).getHelp().level === `admin`) {
      adminPermissions.forEach((adminPerms, permGuildID) => {
        permissionData.set(permGuildID, permissionData.get(permGuildID) ? permissionData.get(permGuildID).concat({id: commandID, permissions: adminPerms}) : [{id: commandID, permissions: adminPerms}]);
      });
    } else if (commandModules.get(commandName).getHelp().level === `developer`) {
      adminPermissions.forEach((_, permGuildID) => {
        permissionData.set(permGuildID, permissionData.get(permGuildID) ? permissionData.get(permGuildID).concat({id: commandID, permissions: devPermissions}) : [{id: commandID, permissions: devPermissions}]);
      });
    }
  });
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
  adminPermissions.clear();
  devPermissions.clear();
  permissionData.clear();
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
