// Imports
const playerManager = require(`../helpers/player-manager`);

// Exports
module.exports = {handle, getHelp};

// Help command text
const help = {
  text: `Skips the currently playing audio.`,
  level: `user`,
};

// Exported functions
function handle(client, msg) {
  playerManager.checkUser(msg, `skip`);
}

function getHelp() {
  return help;
}
