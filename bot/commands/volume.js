// Imports
const playerManager = require(`../helpers/player-manager`);

// Exports
module.exports = {handle, getHelp};

// Help command text
const help = {
  text: `Change the playing audio's volume.`,
  level: `user`,
};

// Exported functions
function handle(client, interaction) {
  playerManager.checkUser(interaction, `volume`);
}

function getHelp() {
  return help;
}
