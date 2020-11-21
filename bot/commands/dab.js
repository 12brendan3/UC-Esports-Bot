// Exports
module.exports = {handle, getHelp};

// Help command text
const help = null;

// Exported functions
function handle(client, msg) {
  const dabEmoji = client.emojis.cache.find((emoji) => emoji.name === `ReimuDab`);

  if (dabEmoji && !dabEmoji.deleted) {
    msg.channel.send(`${dabEmoji}`);
  } else {
    msg.reply(`there was an error running the command.`);
  }

  if (msg.deletable) {
    msg.delete();
  }
}

function getHelp() {
  return help;
}
