// Exports
module.exports = {handle, getHelp};

// Help command text
const help = {
  text: `Sends the baercot emoji in chat.`,
  level: `user`,
};

// Exported functions
function handle(client, interaction) {
  const baercotEmoji = client.emojis.cache.find((emoji) => emoji.name === `baercot`);

  if (baercotEmoji && !baercotEmoji.deleted) {
    interaction.channel.send(`${baercotEmoji}`);
    interaction.reply({content: `Sent!`, ephemeral: true});
  } else {
    interaction.reply({content: `There was an error running the command.`, ephemeral: true});
  }
}

function getHelp() {
  return help;
}
