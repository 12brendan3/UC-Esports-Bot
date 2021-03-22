// Exports
module.exports = {handle, getHelp};

// Help command text
const help = null;

// Exported functions
function handle(client, msg) {
  const baercotEmoji = client.emojis.cache.find((emoji) => emoji.name === `baercot`);

  if (baercotEmoji && !baercotEmoji.deleted) {
    msg.channel.send(`${baercotEmoji}`);
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
