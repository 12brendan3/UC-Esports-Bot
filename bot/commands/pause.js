// Imports
const playerManager = require(`../helpers/player-manager`);

// Exports
module.exports = {handle, getHelp};

// Help command text
const help = {
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
