const replyHelper = require(`../helpers/reply-helper`);

// Exports
module.exports = {handle, getHelp};

// Help command text
const help = {
  text: `Replies with "pong!" ...and the bot's actual ping.`,
  level: `user`,
};

// Exported functions
function handle(client, interaction) {
  replyHelper.interactionReply(interaction, `Pong! (${client.ws.ping} ms)`);
}

function getHelp() {
  return help;
}
