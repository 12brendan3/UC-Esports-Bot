const Discord = require(`discord.js`);

const database = require('../helpers/database-manager');

// Exports
module.exports = {handle};

// Exported function
function handle(client, msg) {
  if (msg.channel.type !== `dm` && !msg.author.bot) {
    logMessageDeletion(msg);
  }
}

// Private function
async function logMessageDeletion(msg) {
  const guildSettings = await database.getEntry(`Guilds`, {guildID: msg.guild.id});

  if (guildSettings && guildSettings.logsChannelID) {
    const logsChannel = msg.guild.channels.cache.get(guildSettings.logsChannelID);
    const embed = new Discord.MessageEmbed();

    embed.setColor(`#FF0000`);
    embed.setAuthor(msg.member.displayName, msg.author.displayAvatarURL());
    embed.setDescription(`Message sent by ${msg.author} was deleted in ${msg.channel}.`);
    if (msg.content) {
      embed.addField(`Message`, msg.content.length > 1000 ? msg.content.substr(0, 1000) : msg.content);
      if (msg.content.length > 1000) {
        embed.addField(`Message Continued`, msg.content.substr(1000, msg.content.length));
      }
    }
    embed.setTimestamp();
    embed.setFooter(msg.author.tag);

    logsChannel.send(embed);
  }
}
