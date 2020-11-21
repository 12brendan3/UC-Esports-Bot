// Exports
module.exports = {handle, getHelp};

// Help command text
const help = null;

// Exported functions
function handle(client, msg) {
  msg.channel.send(`🦀`);

  if (msg.deletable) {
    msg.delete();
  }
}

function getHelp() {
  return help;
}
