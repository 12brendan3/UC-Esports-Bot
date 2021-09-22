// const bearcatManager = require(`../helpers/bearcat-manager`);
const replyHelper = require(`../helpers/interaction-helper`);

// Exports
module.exports = {handle, getHelp};

// Help command text
const help = null;

/* {
  text: `Allows a user to modify or complete their profile.`,
  level: `user`,
}; */

// Exported functions
function handle(client, interaction) {
  replyHelper.interactionReply(interaction, `This feature hasn't been completed yet, check again at a later time.`);
}

function getHelp() {
  return help;
}
