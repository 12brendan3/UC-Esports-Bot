const Discord = require(`discord.js`);

let client;

const modules = require(`./helpers/module-manager`);
const settings = require(`./helpers/settings-manager`);
const database = require(`./helpers/database-manager`);
const reactManager = require(`./helpers/role-react-manager-2`);

// Exports
module.exports = {startBot, stopBot, restartBot};

// Exported functions
async function startBot() {
  client = new Discord.Client({partials: ['MESSAGE', 'REACTION']});

  await database.syncTables();

  await reactManager.loadRoleData();

  modules.registerAll(client);

  settings.loadAll();

  const botToken = settings.getAuth().botToken;

  if (botToken && botToken !== `replace me`) {
    client.login(botToken);
  } else {
    console.info(`No bot token found, please edit the "settings.json" file in the storage folder.\nYou can then type "restart" and then press enter.\nTo exit, type "exit" and then press enter.`);
  }
}

function stopBot() {
  client.destroy();
}

function restartBot() {
  stopBot();
  settings.clearAll();
  modules.clearAll();
  startBot();
}
