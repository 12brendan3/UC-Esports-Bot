const Discord = require(`discord.js`);

const database = require(`../helpers/database-manager`);

// Regex
const regexImage = RegExp(`^.+(\\.(jpe?g|png|gif|bmp))$`);

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

    if (msg.attachments) {
      const images = [];
      msg.attachments.each((attachment) => {
        if (attachment.size < 8000000 && regexImage.test(attachment.name)) {
          images.push(attachment.url);
        }
      });
      embed.setImage(images[0]);
    }

    embed.setTimestamp();
    embed.setFooter(msg.author.tag);

    logsChannel.send(embed);
  }
}
