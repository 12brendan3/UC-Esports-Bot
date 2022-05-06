// Imports
const playerManager = require(`../helpers/player-manager`);

// Exports
module.exports = {handle, getHelp};

// Help command text
const help = {
  text: `Stops audio playback, clears the queue, and leaves the channel.`,
  level: `user`,
  allowDM: false,
};

// Exported functions
function handle(client, interaction) {
  playerManager.checkUser(interaction, `leave`);
}

function getHelp() {
  return help;
}
