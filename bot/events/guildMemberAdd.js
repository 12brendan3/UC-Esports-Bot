const database = require(`../helpers/database-manager`);

// Exports
module.exports = {handle};

// Exported function
async function handle(client, member) {
  const guildSettings = await database.getEntry(`Guilds`, {guildID: member.guild.id});

  if (guildSettings && guildSettings.welcomeMessage && guildSettings.welcomeChannelID) {
    const welcomeMessage = guildSettings.welcomeMessage.replace(`!!newuser!!`, `${member}`);
    const welcomeChannel = member.guild.channels.cache.get(guildSettings.welcomeChannelID);
    welcomeChannel.send(welcomeMessage);
  }
}
