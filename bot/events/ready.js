const weather = require(`../helpers/weather-manager`);
const taskManger = require(`../helpers/task-manager`);
const commandManager = require(`../helpers/command-manager`);
const timeouts = require(`../helpers/timeout-manager`);
const giveaways = require(`../helpers/giveaway-manager`);

// Exports
module.exports = {handle};

// Exported Function
async function handle(client) {
  console.info(`Bot ready!\nLogged in as: ${client.user.username}`);

  console.info(`Fetching members from all guilds...`);

  const guildFetch = [];

  client.guilds.cache.each((guild) => {
    guildFetch.push(guild.members.fetch({withPresences: true}));
  });

  await Promise.all(guildFetch);

  console.info(`Fetched members from all guilds.`);

  taskManger.registerExisting(client);

  weather.setBotStatus(client);

  commandManager.setSlashCommands(client);

  timeouts.registerExisting(client);

  giveaways.registerExisting(client);
}
