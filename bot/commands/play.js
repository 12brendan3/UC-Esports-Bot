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
function handle(client, interaction) {
  playerManager.checkUser(interaction, `play`);
}

function getHelp() {
  return help;
}
