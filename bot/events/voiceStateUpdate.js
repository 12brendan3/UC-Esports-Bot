// Imports
const playerManager = require(`../helpers/player-manager`);

// Exports
module.exports = {handle};

// Exported function
function handle(oldState, newState) {
  playerManager.checkChannel(newState);
}
