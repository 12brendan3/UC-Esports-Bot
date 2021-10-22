const Discord = require(`discord.js`);

const database = require(`../helpers/database-manager`);

const WordFilter = require(`bad-words`);

const filter = new WordFilter();

const profaneWhitelist = new Set([`772589330710659083`]);

// Exports
module.exports = {handle};

// Exported function
function handle(client, msgOld, msgNew) {
  if (msgNew.channel.type !== `DM` && !msgNew.author.bot) {
    logMessageEdit(msgOld, msgNew);
  }

  checkProfane(msgNew);
}

// Private function
async function logMessageEdit(msgOld, msgNew) {
  const guildSettings = await database.getEntry(`Guilds`, {guildID: msgNew.guildId});

  if (guildSettings && guildSettings.logsChannelID && msgOld.content !== msgNew.content) {
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
    embed.addField(`Message Link`, `[View Message](${msgNew.url})`);
    embed.setTimestamp();
    embed.setFooter(msgNew.author.tag);

    logsChannel.send({embeds: [embed]});
  }
}

function checkProfane(msg) {
  if (!msg.guild || !profaneWhitelist.has(msg.guildId)) {
    return;
  }

  if (filter.isProfane(msg.content) && msg.deletable) {
    msg.delete();
  }
}
