// Exports
module.exports = {handle, getHelp};

// Help command text
const help = {
  text: `Replies with "pong!" ...and the bot's actual ping.`,
  level: `user`,
};

// Exported functions
function handle(client, msg) {
  msg.reply(`pong! (${client.ws.ping} ms)`);
}

function getHelp() {
  return help;
}
