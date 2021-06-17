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
async function handle(client, interaction) {
  try {
    const result = await database.getEntry(`XP`, {userID: interaction.user.id});

    if (result) {
      const embed = new Discord.MessageEmbed();

      embed.setColor(`#CC00FF`);
      embed.setAuthor(interaction.user.username, interaction.user.displayAvatarURL());
      embed.setTimestamp();
      embed.setDescription(`XP: ${result.XP}`);

      interaction.reply({embeds: [embed]});
    } else {
      interaction.reply(`You don't have any XP.`);
    }
  } catch {
    interaction.reply({content: `There was an error fetching your XP.  Tell the bot devs if the issue persists.`, ephemeral: true});
  }
}

function getHelp() {
  return help;
}
