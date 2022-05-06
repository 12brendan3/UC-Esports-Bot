// Imports
const playerManager = require(`../helpers/player-manager`);

// Exports
module.exports = {handle, getHelp};

// Help command text
const help = {
  text: `Skips the currently playing audio.`,
  level: `user`,
  allowDM: false,
};

// Exported functions
function handle(client, interaction) {
  playerManager.checkUser(interaction, `skip`);
}

function getHelp() {
  return help;
}
