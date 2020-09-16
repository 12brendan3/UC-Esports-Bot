const database = require(`../helpers/database-manager`);

// Exports
module.exports = {handle};

// Exported function
async function handle(client, member) {
  const guildSettings = await database.getEntry(`Guilds`, {guildID: member.guild.id});

  if (guildSettings && guildSettings.welcomeMessage && guildSettings.welcomeChannel) {
    const welcomeMessage = guildSettings.welcomeMessage.replace(`!!newuser!!`, `${member}`);
    const welcomeChannel = member.guild.channels.get(welcomeMessage.welcomeChannel);
    welcomeChannel.send(welcomeMessage);
  }
}
