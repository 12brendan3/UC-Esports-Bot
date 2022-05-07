const Discord = require(`discord.js`);

const database = require(`../helpers/database-manager`);

// Regex
const regexImage = new RegExp(`^.+(\\.(jpe?g|png|gif|bmp))$`);

// Exports
module.exports = {handle};

// Exported function
function handle(client, msg) {
  if (msg.channel && !msg.author.bot) {
    logMessageDeletion(msg);
  }
}

// Private function
async function logMessageDeletion(msg) {
  const guildSettings = await database.getEntry(`Guilds`, {guildID: msg.guildId});

  if (guildSettings && guildSettings.logsChannelID) {
    const logsChannel = msg.guild.channels.cache.get(guildSettings.logsChannelID);
    const embed = new Discord.MessageEmbed();

    embed.setColor(`#FF0000`);
    if (msg.member && msg.author) {
      embed.setAuthor({name: msg.member.displayName, iconURL: msg.author.displayAvatarURL()});
      embed.setDescription(`Message sent by ${msg.author} was deleted in ${msg.channel}.`);
      embed.setFooter({text: msg.author.tag});
    } else if (msg.author) {
      embed.setAuthor({name: msg.author.tag, iconURL: msg.author.displayAvatarURL()});
      embed.setDescription(`Message sent by ${msg.author} was deleted in ${msg.channel}.`);
      embed.setFooter({text: msg.author.id});
    } else {
      embed.setAuthor({name: `Unknown User`});
      embed.setDescription(`Message was deleted in ${msg.channel}.`);
      embed.setFooter({text: `Unknown User`});
    }

    if (msg.content) {
      embed.addField(`Message`, msg.content.length > 1000 ? msg.content.substr(0, 1000) : msg.content);
      if (msg.content.length > 1000) {
        embed.addField(`*** ***`, msg.content.substr(1000, msg.content.length));
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

    logsChannel.send({embeds: [embed]});
  }
}
