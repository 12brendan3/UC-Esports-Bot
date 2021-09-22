const replyHelper = require(`../../helpers/interaction-helper`);

// Exports
module.exports = {handle, getHelp};

// Help command text
const help = {
  text: `Sends the baercot emoji in chat.`,
  level: `secret`,
};

// Exported functions
function handle(client, interaction) {
  const baercotEmoji = client.emojis.cache.find((emoji) => emoji.name === `baercot`);

  if (baercotEmoji && !baercotEmoji.deleted) {
    interaction.channel.send(`${baercotEmoji}`);
    replyHelper.interactionReply(interaction, {content: `Sent!`, ephemeral: true});
  } else {
    replyHelper.interactionReply(interaction, {content: `There was an error running the command.`, ephemeral: true});
  }
}

function getHelp() {
  return help;
}
