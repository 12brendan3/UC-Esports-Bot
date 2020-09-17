// Exports
module.exports = {handle, getHelp};

const help =
`Replies with "pong!" ...and the bot's actual ping.`;

// Exported functions
function handle(client, msg) {
  msg.reply(`pong! (${client.ws.ping} ms)`);
}

function getHelp() {
  return help;
}
