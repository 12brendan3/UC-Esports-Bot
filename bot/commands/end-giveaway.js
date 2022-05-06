// Imports
const giveawayManager = require(`../helpers/giveaway-manager`);
const replyHelper = require(`../helpers/interaction-helper`);

// Exports
module.exports = {handle, getHelp};

// Help command text
const help = {
  text: `Ends a giveaway early, effectively cancelling it. Doesn't roll winners by default.`,
  level: `admin`,
  allowDM: false,
  options: [
    {
      name: `name`,
      type: `STRING`,
      description: `The name of the giveaway to end early.`,
      required: true,
    },
    {
      name: `roll`,
      type: `BOOLEAN`,
      description: `Whether or not to still roll winners.`,
      required: false,
    },
  ],
};

// Exported Functions
async function handle(client, interaction) {
  if (interaction.channel.type === `DM`) {
    replyHelper.interactionReply(interaction, `This command has to be used in a server.`);
    return;
  }

  giveawayManager.endOne(client, interaction);
}

function getHelp() {
  return help;
}
