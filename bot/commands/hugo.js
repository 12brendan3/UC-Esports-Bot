// Exports
module.exports = {handle, getHelp};

// Help command text
const help = null;

// Exported functions
function handle(client, msg) {
  const hugoEmoji = client.emojis.cache.find((emoji) => emoji.name === `csHUGO`);

  if (hugoEmoji && !hugoEmoji.deleted) {
    msg.channel.send(`${hugoEmoji}`);
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
