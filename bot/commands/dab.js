// Exports
module.exports = {handle, getHelp};

// Help command text
const help = null;

// Exported functions
function handle(client, msg) {
  const random = Math.floor(Math.random() * 2);
  let emojiName;

  if (random === 1) {
    emojiName = `ReimuDab`;
  } else {
    emojiName = `MikuDab`;
  }

  const dabEmoji = client.emojis.cache.find((emoji) => emoji.name === emojiName);

  if (dabEmoji && !dabEmoji.deleted) {
    msg.channel.send(`${dabEmoji}`);
  } else {
    msg.reply(`There was an error running the command.`);
  }

  if (msg.deletable) {
    msg.delete();
  }
}

function getHelp() {
  return help;
}
