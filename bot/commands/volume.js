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
function handle(client, msg) {
  playerManager.checkUser(msg, `volume`);
}

function getHelp() {
  return help;
}
