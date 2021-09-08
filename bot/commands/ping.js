// Exports
module.exports = {handle, getHelp};

// Help command text
const help = {
  text: `Replies with "pong!" ...and the bot's actual ping.`,
  level: `user`,
};

// Exported functions
function handle(client, interaction) {
  interaction.reply(`Pong! (${client.ws.ping} ms)`);
}

function getHelp() {
  return help;
}
