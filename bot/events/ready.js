const weather = require(`../helpers/weather-manager`);

// Exports
module.exports = {handle};

// Exported Function
function handle(client) {
  console.info(`Bot ready!\nLogged in as: ${client.user.username}`);

  client.guilds.cache.each(async (guild) => {
    console.info(`Fetching all members from "${guild.name}."`);

    await guild.members.fetch({withPresences: true});

    console.info(`Fetched all members from "${guild.name}."`);
  });

  weather.setBotStatus(client);
}
