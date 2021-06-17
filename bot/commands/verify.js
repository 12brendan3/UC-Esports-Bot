const bearcatManager = require(`../helpers/bearcat-manager`);

// Exports
module.exports = {handle, getHelp};

// Help command text
const help = {
  text: `Allows a user to verify they're a student at UC and grants the verified role in servers.`,
  level: `user`,
  options: [
    {
      name: `email`,
      type: `STRING`,
      description: `The UC email to link and send a verification code to.`,
      required: false,
    },
  ],
};

// Exported functions
function handle(client, interaction) {
  bearcatManager.verifyUser(interaction);
}

function getHelp() {
  return help;
}
