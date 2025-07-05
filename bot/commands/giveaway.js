// Imports
const Discord = require(`discord.js`);

const giveawayManager = require(`../helpers/giveaway-manager`);
const replyHelper = require(`../helpers/interaction-helper`);

// Exports
module.exports = {handle, getHelp};

// Help command text
const help = {
  type: Discord.ApplicationCommandType.ChatInput,
  text: `Runs a giveaway`,
  level: `admin`,
  allowDM: false,
  options: [
    {
      name: `name`,
      type: Discord.ApplicationCommandOptionType.String,
      description: `The name of the giveaway.`,
      required: true,
    },
    {
      name: `duration`,
      type: Discord.ApplicationCommandOptionType.String,
      description: `How long to run the giveaway. (Format: 1d2h3m4s)`,
      required: true,
    },
    {
      name: `description`,
      type: Discord.ApplicationCommandOptionType.String,
      description: `The description of the giveaway.`,
      required: false,
    },
    {
      name: `winners`,
      type: Discord.ApplicationCommandOptionType.Integer,
      description: `The number of winners for the giveaway. (Default 1)`,
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

  giveawayManager.addOne(client, interaction);
}

function getHelp() {
  return help;
}
