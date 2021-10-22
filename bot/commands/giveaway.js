// Imports
const giveawayManager = require(`../helpers/giveaway-manager`);
const replyHelper = require(`../helpers/interaction-helper`);

// Exports
module.exports = {handle, getHelp};

// Help command text
const help = {
  text: `Runs a giveaway`,
  level: `admin`,
  options: [
    {
      name: `name`,
      type: `STRING`,
      description: `The name of the giveaway.`,
      required: true,
    },
    {
      name: `duration`,
      type: `STRING`,
      description: `How long to run the giveaway. (Format: 1d2h3m4s)`,
      required: true,
    },
    {
      name: `description`,
      type: `STRING`,
      description: `The description of the giveaway.`,
      required: false,
    },
    {
      name: `winners`,
      type: `INTEGER`,
      description: `The number of winners for the giveaway. (Default 1)`,
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

  giveawayManager.addOne(client, interaction);
}

function getHelp() {
  return help;
}
