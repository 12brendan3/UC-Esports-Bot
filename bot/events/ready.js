const weather = require(`../helpers/weather-manager`);
const taskManger = require(`../helpers/task-manager`);
const modules = require(`../helpers/module-manager`);

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

  await registerSlashCommands(client);
}

async function registerSlashCommands(client) {
  console.info(`Setting slash commands....`);

  const guild = client.guilds.cache.get(`296745121318305794`);

  const slashCommands = [];
  const commands = modules.getCommands();
  for (const key of Object.keys(commands)) {
    const helpInfo = commands[key].getHelp();
    if (helpInfo) {
      slashCommands.push({name: key, description: helpInfo.text, options: helpInfo.options});
    }
  }

  await guild.commands.set(slashCommands);
  console.info(`Slash commands set.`);
}
