// Exports
module.exports = {handle, getHelp};

const help =
'Replies with "pong!"';

// Exported functions
function handle(client, msg) {
  msg.reply('pong!');
}

function getHelp() {
  return help;
}
