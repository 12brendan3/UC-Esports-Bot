// Imports
const playerManager = require(`../helpers/player-manager`);

// Exports
module.exports = {handle, getHelp};

// Help command text
const help = {
  text: `Plays audio from YouTube.  Adds to queue or resumes paused audio.`,
  level: `user`,
  options: [
    {
      name: `ytsearch`,
      description: `The URL or search term.  Only needed when adding to queue.`,
      type: `STRING`,
      required: false,
    },
  ],
};

// Exported functions
function handle(client, interaction) {
  playerManager.checkUser(interaction, `play`);
}

function getHelp() {
  return help;
}
