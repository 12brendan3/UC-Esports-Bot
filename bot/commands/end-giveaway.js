// Imports
const giveawayManager = require(`../helpers/giveaway-manager`);

// Exports
module.exports = {handle, getHelp};

// Help command text
const help = {
  text: `Ends a giveaway early, effectively cancelling it. Doesn't roll winners by default.`,
  level: `admin`,
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
  if (interaction.channel.type === `dm`) {
    interaction.reply(`This command has to be used in a server.`);
    return;
  }

  giveawayManager.endOne(client, interaction);
}

function getHelp() {
  return help;
}
