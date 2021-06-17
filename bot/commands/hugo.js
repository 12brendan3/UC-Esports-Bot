// Exports
module.exports = {handle, getHelp};

// Help command text
const help = {
  text: `Sends the csHUGO emoji in chat.`,
  level: `user`,
};

// Exported functions
function handle(client, interaction) {
  const hugoEmoji = client.emojis.cache.find((emoji) => emoji.name === `csHUGO`);

  if (hugoEmoji && !hugoEmoji.deleted) {
    interaction.channel.send(`${hugoEmoji}`);
    interaction.reply({content: `Sent!`, ephemeral: true});
  } else {
    interaction.reply({content: `There was an error running the command.`, ephemeral: true});
  }
}

function getHelp() {
  return help;
}
