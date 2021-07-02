// Imports
const playerManager = require(`../helpers/player-manager`);

// Exports
module.exports = {handle, getHelp};

// Help command text
const help = {
  text: `Plays audio from YouTube.  Also resumes paused audio.`,
  level: `user`,
};

// Exported functions
function handle(client, msg) {
  playerManager.checkUser(msg, `play`);
}

function getHelp() {
  return help;
}
