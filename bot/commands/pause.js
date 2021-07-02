// Imports
const playerManager = require(`../helpers/player-manager`);

// Exports
module.exports = {handle, getHelp};

// Help command text
const help = {
  text: `Pauses playing audio.`,
  level: `user`,
};

// Exported functions
function handle(client, msg) {
  playerManager.checkUser(msg, `pause`);
}

function getHelp() {
  return help;
}
