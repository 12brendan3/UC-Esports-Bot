const Discord = require(`discord.js`);

const replyHelper = require(`../helpers/interaction-helper`);

// Exports
module.exports = {handle, getHelp};

// Help command text
const help = {
  type: Discord.ApplicationCommandType.ChatInput,
  text: `Replies with "pong!" ...and the bot's actual ping.`,
  level: `user`,
  allowDM: true,
};

// Exported functions
function handle(client, interaction) {
  replyHelper.interactionReply(interaction, `Pong! (${client.ws.ping} ms)`);
}

function getHelp() {
  return help;
}
