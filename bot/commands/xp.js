const Discord = require(`discord.js`);

const database = require(`../helpers/database-manager`);

// Exports
module.exports = {handle, getHelp};

// Help command text
const help = {
  text: `Replies with your current XP.`,
  level: `user`,
};

// Exported functions
async function handle(client, msg) {
  try {
    const result = await database.getEntry(`XP`, {userID: msg.author.id});

    if (result) {
      const embed = new Discord.MessageEmbed();

      embed.setColor(`#CC00FF`);
      embed.setAuthor(msg.author.tag, msg.author.displayAvatarURL());
      embed.setTimestamp();
      embed.setDescription(`XP: ${result.XP}`);

      msg.channel.send(embed);
    } else {
      msg.reply(`You don't have any XP.`);
    }
  } catch {
    msg.reply(`There was an error fetching your XP.  Tell the bot devs if the issue persists.`);
  }
}

function getHelp() {
  return help;
}
