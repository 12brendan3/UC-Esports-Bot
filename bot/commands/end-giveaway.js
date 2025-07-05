// Imports
const Discord = require(`discord.js`);

const giveawayManager = require(`../helpers/giveaway-manager`);
const replyHelper = require(`../helpers/interaction-helper`);

// Exports
module.exports = {handle, getHelp};

// Help command text
const help = {
  type: Discord.ApplicationCommandType.ChatInput,
  text: `Ends a giveaway early, effectively cancelling it. Doesn't roll winners by default.`,
  level: `admin`,
  allowDM: false,
  options: [
    {
      name: `name`,
      type: Discord.ApplicationCommandOptionType.String,
      description: `The name of the giveaway to end early.`,
      required: true,
    },
    {
      name: `roll`,
      type: Discord.ApplicationCommandOptionType.Boolean,
      description: `Whether or not to still roll winners.`,
      required: false,
    },
  ],
};

// Exported Functions
async function handle(client, interaction) {
  if (!interaction.channel) {
    replyHelper.interactionReply(interaction, `This command has to be used in a server.`);
    return;
  }

  giveawayManager.endOne(client, interaction);
}

function getHelp() {
  return help;
}
