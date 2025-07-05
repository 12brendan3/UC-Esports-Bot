// Imports
const Discord = require(`discord.js`);

const playerManager = require(`../helpers/player-manager`);

// Exports
module.exports = {handle, getHelp};

// Help command text
const help = {
  type: Discord.ApplicationCommandType.ChatInput,
  text: `Pauses playing audio.`,
  level: `user`,
  allowDM: false,
};

// Exported functions
function handle(client, interaction) {
  playerManager.checkUser(interaction, `pause`);
}

function getHelp() {
  return help;
}
