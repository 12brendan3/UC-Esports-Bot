const Discord = require(`discord.js`);

let client;

const eventManager = require(`./helpers/event-manager`);
const commandManager = require(`./helpers/command-manager`);
const settings = require(`./helpers/settings-manager`);
const database = require(`./helpers/database-manager`);
const reactManager = require(`./helpers/role-react-manager-2`);
const bearcatManager = require(`./helpers/bearcat-manager`);
const playerManager = require(`./helpers/player-manager`);
const timeouts = require(`./helpers/timeout-manager`);

// Exports
module.exports = {startBot, stopBot, restartBot, migrateAdmins};

// Exported functions
async function startBot() {
  client = new Discord.Client({
    partials: [`User`, `GuildMember`, `Message`, `Reaction`],
    intents: [`Guilds`, `GuildMembers`, `GuildEmojisAndStickers`, `GuildVoiceStates`, `GuildPresences`, `GuildMessages`, `GuildMessageReactions`, `DirectMessages`],
  });

  await database.syncTables();

  await reactManager.loadRoleData();

  commandManager.loadAll();

  eventManager.loadAll(client);

  settings.loadAll();

  bearcatManager.prepEmail();

  playerManager.prepKey();

  const botToken = settings.getAuth().botToken;

  console.info(`Bot token set.`);

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
  eventManager.clearAll();
  commandManager.clearAll();
  timeouts.clearAll();
  startBot();
}

function migrateAdmins() {
  console.info(`Migrating admins, please wait....`);

  client.guilds.cache.forEach(async (guild) => {
    const admins = await database.getAllEntries(`ServerAdmins`, {guildID: guild.id});
    if (admins) {
      const botRole = guild.roles.botRoleFor(client.user.id);
      const newRole = await guild.roles.create({name: `Popcorn`, position: botRole ? botRole.position : null, color: `#F1CA16`, reason: `New Bearcat Bot admin role.`});
      await database.updateEntry(`Guilds`, {guildID: guild.id}, {adminRoleID: newRole.id});
      admins.forEach((admin) => {
        const user = guild.members.cache.get(admin.userID);
        if (user) {
          user.roles.add(newRole, `Bot admin on old system.`);
        }
      });
    }
  });

  console.info(`Done migrating admins!\nThe bot will exit in 10 seconds.`);

  setTimeout(() => {
    stopBot();
    process.exit();
  }, 10000);
}
