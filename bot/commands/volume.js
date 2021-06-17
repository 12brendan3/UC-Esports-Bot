// Imports
const playerManager = require(`../helpers/player-manager`);

// Exports
module.exports = {handle, getHelp};

// Help command text
const help = {
  text: `Change the playing audio's volume.`,
  level: `user`,
  options: [
    {
      name: `volume`,
      description: `The new volume, on a scale of 1-100.`,
      type: `INTEGER`,
      required: true,
    },
  ],
};

// Exported functions
function handle(client, interaction) {
  playerManager.checkUser(interaction, `volume`);
}

function getHelp() {
  return help;
}
