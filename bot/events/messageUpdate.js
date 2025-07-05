const Discord = require(`discord.js`);

const database = require(`../helpers/database-manager`);

// Exports
module.exports = {handle};

// Exported function
function handle(client, msgOld, msgNew) {
  if (msgNew.channel && !msgNew.author.bot) {
    logMessageEdit(msgOld, msgNew);
  }
}

// Private function
async function logMessageEdit(msgOld, msgNew) {
  const guildSettings = await database.getEntry(`Guilds`, {guildID: msgNew.guildId});

  if (guildSettings && guildSettings.logsChannelID && msgOld.content !== msgNew.content) {
    const logsChannel = msgNew.guild.channels.cache.get(guildSettings.logsChannelID);
    const embed = new Discord.EmbedBuilder();

    embed.setColor(`#00DDFF`);

    embed.setAuthor({name: msgNew.member.displayName, iconURL: msgNew.author.displayAvatarURL()});

    embed.setDescription(`Message sent by ${msgNew.author} in ${msgNew.channel} was edited.`);

    if (msgOld.content) {
      embed.setFields({ name: `Before`, value: msgOld.content.length > 1000 ? msgOld.content.substr(0, 1000) : msgOld.content });
      if (msgOld.content.length > 1000) {
        embed.addFields({ name: `*** ***`, value: msgOld.content.substr(1000, msgOld.content.length) });
      }
    }
    if (msgNew.content) {
      embed.addFields({ name: `After`, value: msgNew.content.length > 1000 ? msgNew.content.substr(0, 1000) : msgNew.content });
      if (msgNew.content.length > 1000) {
        embed.addFields({ name: `*** ***`, value: msgNew.content.substr(1000, msgNew.content.length) });
      }
    }
    embed.addFields({ name: `Message Link`, value: `[View Message](${msgNew.url})` });
    embed.setTimestamp();
    embed.setFooter({text: msgNew.author.tag});

    logsChannel.send({embeds: [embed]});
  }
}
