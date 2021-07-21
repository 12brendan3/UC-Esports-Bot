const weather = require(`../helpers/weather-manager`);
const taskManger = require(`../helpers/task-manager`);
const modules = require(`../helpers/module-manager`);

// Exports
module.exports = {handle, registerSlashCommands};

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
  const guild2 = client.guilds.cache.get(`145731048892923904`);

  const slashCommands = [];
  const commands = modules.getCommands();
  for (const command of commands.keys()) {
    const helpInfo = commands.get(command).getHelp();
    if (helpInfo) {
      slashCommands.push({name: command, description: helpInfo.text, options: helpInfo.options});
    }
  }

  await guild.commands.set(slashCommands);
  await guild2.commands.set(slashCommands);
  console.info(`Slash commands set.`);
}
