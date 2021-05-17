const weather = require(`../helpers/weather-manager`);
const cronos = require(`cronosjs`);
const Discord = require(`discord.js`);

// Exports
module.exports = {handle, clear};

// Vars
let cronTask;

// Exported Function
function handle(client) {
  console.info(`Bot ready!\nLogged in as: ${client.user.username}`);

  console.info(`Fetching UC Esports #lol-general channel...`);
  const esportsGuild = client.guilds.cache.get(`313455932896182283`);
  const lolGeneralChannel = esportsGuild ? esportsGuild.channels.cache.get(`427300580306976788`) : false;
  if (lolGeneralChannel) {
    const image = new Discord.MessageAttachment(`./assets/img/lol-general-meme.png`, `lol.png`);
    cronTask = cronos.scheduleTask(`00 19 * * *`, () => {
      lolGeneralChannel.send(image);
    });
    console.info(`Got the channel and set up for posting at 7 PM every day.`);
  } else {
    console.info(`Failed to fetch the channel.`);
  }

  client.guilds.cache.each(async (guild) => {
    console.info(`Fetching all members from "${guild.name}."`);

    await guild.members.fetch({withPresences: true});

    console.info(`Fetched all members from "${guild.name}."`);
  });

  weather.setBotStatus(client);
}

function clear() {
  console.info(`Clearing LoL 4 PM message post task...`);
  cronTask.stop();
  console.info(`LoL 4 PM message post task cleared.`);
}
