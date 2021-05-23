const bearcatManager = require(`../helpers/bearcat-manager`);

// Exports
module.exports = {handle, getHelp};

// Help command text
const help = {
  text: `Allows a user to verify they're a student at UC and grants the verified role in servers.`,
  level: `user`,
};

// Exported functions
function handle(client, msg) {
  bearcatManager.verifyUser(msg);
}

function getHelp() {
  return help;
}
