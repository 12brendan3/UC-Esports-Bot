const database = require(`../helpers/database-manager`);
const replyHelper = require(`../helpers/reply-helper`);

// Exports
module.exports = {handle, getHelp};

// Help command text
const help = {
  text: `Provide feedback directly to the bot developers.  Use this command for improvements, bugs, etc.`,
  level: `user`,
  options: [
    {
      name: `feedback`,
      type: `STRING`,
      description: `Your feedback to the developers.`,
      required: true,
    },
  ],
};

// Exported functions
async function handle(client, interaction) {
  try {
    const messageURL = interaction.channel.type === `dm` ? `Sent via DM` : interaction.channel.id;

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
