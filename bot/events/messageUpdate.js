const Discord = require(`discord.js`);

const database = require(`../helpers/database-manager`);

// Exports
module.exports = {handle};

// Exported function
function handle(client, msgOld, msgNew) {
  if (msgNew.channel.type !== `dm` && !msgNew.author.bot) {
    logMessageEdit(msgOld, msgNew);
  }
}

// Private function
async function logMessageEdit(msgOld, msgNew) {
  const guildSettings = await database.getEntry(`Guilds`, {guildID: msgNew.guild.id});

  if (guildSettings && guildSettings.logsChannelID) {
    const logsChannel = msgNew.guild.channels.cache.get(guildSettings.logsChannelID);
    const embed = new Discord.MessageEmbed();

    embed.setColor(`#00DDFF`);
    embed.setAuthor(msgNew.member.displayName, msgNew.author.displayAvatarURL());
    embed.setDescription(`Message sent by ${msgNew.author} in ${msgNew.channel} was edited.`);
    if (msgOld.content) {
      embed.addField(`Before`, msgOld.content.length > 1000 ? msgOld.content.substr(0, 1000) : msgOld.content);
      if (msgOld.content.length > 1000) {
        embed.addField(`*** ***`, msgOld.content.substr(1000, msgOld.content.length));
      }
    }
    if (msgNew.content) {
      embed.addField(`After`, msgNew.content.length > 1000 ? msgNew.content.substr(0, 1000) : msgNew.content);
      if (msgNew.content.length > 1000) {
        embed.addField(`*** ***`, msgNew.content.substr(1000, msgNew.content.length));
      }
    }
    embed.addField(`Message Link`, `[Jump to Message](${msgNew.url})`);
    embed.setTimestamp();
    embed.setFooter(msgNew.author.tag);

    logsChannel.send(embed);
  }
}
