// Imports
const playerManager = require(`../helpers/player-manager`);

// Exports
module.exports = {handle, getHelp};

// Help command text
const help = {
  text: `Stops audio playback, clears the queue, and leaves the channel.`,
  level: `user`,
};

// Exported functions
function handle(client, msg) {
  playerManager.checkUser(msg, `leave`);
}

function getHelp() {
  return help;
}
