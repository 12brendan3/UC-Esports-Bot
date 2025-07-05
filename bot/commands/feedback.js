const Discord = require(`discord.js`);

const database = require(`../helpers/database-manager`);
const replyHelper = require(`../helpers/interaction-helper`);

// Exports
module.exports = {handle, getHelp};

// Help command text
const help = {
  type: Discord.ApplicationCommandType.ChatInput,
  text: `Provide feedback directly to the bot developers.  Use this command for improvements, bugs, etc.`,
  level: `user`,
  allowDM: true,
  options: [
    {
      name: `feedback`,
      type: Discord.ApplicationCommandOptionType.String,
      description: `Your feedback to the developers.`,
      required: true,
    },
  ],
};

// Exported functions
async function handle(client, interaction) {
  try {
    const messageURL = interaction.channel ? interaction.channel.id : `Sent via DM`;

    const result = await database.createEntry(`Feedback`, {userID: interaction.user.id, messageURL, message: interaction.options.get(`feedback`).value, time: interaction.createdTimestamp});

    if (result) {
      replyHelper.interactionReply(interaction, {content: `Your feedback has been recorded!`, ephemeral: true});
    } else {
      replyHelper.interactionReply(interaction, {content: `There was an error saving your feedback.  Tell the bot developers directly if the issue persists.`, ephemeral: true});
    }
  } catch {
    replyHelper.interactionReply(interaction, {content: `Command timed out, please try again.`, ephemeral: true});
  }
}

function getHelp() {
  return help;
}
