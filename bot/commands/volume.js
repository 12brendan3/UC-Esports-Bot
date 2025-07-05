// Imports
const Discord = require(`discord.js`);

const playerManager = require(`../helpers/player-manager`);

// Exports
module.exports = {handle, getHelp};

// Help command text
const help = {
  type: Discord.ApplicationCommandType.ChatInput,
  text: `Change the playing audio's volume.`,
  level: `user`,
  allowDM: false,
  options: [
    {
      name: `volume`,
      description: `The new volume, on a scale of 1-100.`,
      type: Discord.ApplicationCommandOptionType.Integer,
      required: true,
    },
  ],
};

// Exported functions
function handle(client, interaction) {
  playerManager.checkUser(interaction, `volume`);
}

function getHelp() {
  return help;
}
