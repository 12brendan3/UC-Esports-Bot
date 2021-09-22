const database = require(`../helpers/database-manager`);
const collectors = require(`../helpers/collectors`);
const replyHelper = require(`../helpers/interaction-helper`);

// Exports
module.exports = {handle, getHelp};

// Help command text
const help = {
  text: `Allows developers to transfer XP from one user to another.`,
  level: `developer`,
  options: [
    {
      name: `userfrom`,
      type: `USER`,
      description: `The user to transfer XP from.`,
      required: true,
    },
    {
      name: `userto`,
      type: `USER`,
      description: `The user to transfer XP to.`,
      required: true,
    },
  ],
};

// Exported functions
function handle(client, interaction) {
  transferXP(interaction);
}

function getHelp() {
  return help;
}

// Private Functions
async function transferXP(interaction) {
  try {
    const resultFrom = await database.getEntry(`XP`, {userID: interaction.options.get(`userfrom`).value});
    const resultTo = await database.getEntry(`XP`, {userID: interaction.options.get(`userto`).value});

    let newXP = 0;
    if (resultTo && resultTo.XP) {
      newXP = resultTo.XP;
    }

    if (resultFrom && resultFrom.XP) {
      newXP += resultFrom.XP;
    } else {
      replyHelper.interactionReply(interaction, {content: `${interaction.options.get(`userfrom`).user} has no XP!`, ephemeral: true});
      return;
    }

    replyHelper.interactionReply(interaction, `This will transfer all XP from ${interaction.options.get(`userfrom`).user} to ${interaction.options.get(`userto`).user}.\nPlease type "confirm" to confirm.`);

    const confirmation = await collectors.oneMessageFromUser(interaction.channel, interaction.user.id);

    if (confirmation.first().content === `confirm`) {
      await database.updateOrCreateEntry(`XP`, {userID: interaction.options.get(`userto`).value}, {XP: newXP});
      await database.updateOrCreateEntry(`XP`, {userID: interaction.options.get(`userfrom`).value}, {XP: 0});

      interaction.followUp(`XP has been transferred!`);
    } else {
      interaction.followUp(`Confirmation failed, process canceled.`);
    }
  } catch (err) {
    console.error(err);
    replyHelper.interactionReply(interaction, {content: `Process canceled, there was an error.`, ephemeral: true});
  }
}
