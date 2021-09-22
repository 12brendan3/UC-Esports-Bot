const database = require(`../helpers/database-manager`);
const replyHelper = require(`../helpers/reply-helper`);

// Exports
module.exports = {handle, getHelp};

// Help command text
const help = {
  text: `Allows developers to delete feedback from the database.`,
  level: `developer`,
  options: [
    {
      name: `entryid`,
      type: `STRING`,
      description: `The ID of the entry to remove.`,
      required: true,
    },
  ],
};

// Exported functions
function handle(client, interaction) {
  removeFeedback(interaction);
}

async function removeFeedback(interaction) {
  try {
    const result = await database.removeEntry(`Feedback`, {ID: interaction.options.get(`entryid`).value});
    if (result) {
      replyHelper.interactionReply(interaction, {content: `The feedback entry was removed.`, ephemeral: true});
    } else {
      replyHelper.interactionReply(interaction, {content: `No feedback with that ID was found.`, ephemeral: true});
    }
  } catch (err) {
    console.error(err);
    replyHelper.interactionReply(interaction, {content: `There was an error.`, ephemeral: true});
  }
}

function getHelp() {
  return help;
}
