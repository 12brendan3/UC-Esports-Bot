const Discord = require(`discord.js`);

const database = require(`../helpers/database-manager`);
const replyHelper = require(`../helpers/interaction-helper`);

// Exports
module.exports = {handle, getHelp};

// Help command text
const help = {
  type: Discord.ApplicationCommandType.ChatInput,
  text: `Replies with your current XP.`,
  level: `user`,
  allowDM: true,
};

// Exported functions
async function handle(client, interaction) {
  try {
    const result = await database.getEntry(`XP`, {userID: interaction.user.id});

    if (result) {
      const embed = new Discord.EmbedBuilder();

      embed.setColor(`#CC00FF`);

      embed.setAuthor({name: interaction.user.username, iconURL: interaction.user.displayAvatarURL()});

      embed.setTimestamp();
      
      embed.setDescription(`XP: ${result.XP}`);

      replyHelper.interactionReply(interaction, {embeds: [embed]});
    } else {
      replyHelper.interactionReply(interaction, `You don't have any XP.`);
    }
  } catch {
    replyHelper.interactionReply(interaction, {content: `There was an error fetching your XP.  Tell the bot devs if the issue persists.`, ephemeral: true});
  }
}

function getHelp() {
  return help;
}
