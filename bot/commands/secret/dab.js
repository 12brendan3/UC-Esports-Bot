const replyHelper = require(`../../helpers/interaction-helper`);

// Exports
module.exports = {handle, getHelp};

// Help command text
const help = {
  text: `Sends a dabbing emoji in chat.`,
  level: `secret`,
};

// Exported functions
function handle(client, interaction) {
  const random = Math.floor(Math.random() * 2);
  let emojiName;

  if (random === 1) {
    emojiName = `ReimuDab`;
  } else {
    emojiName = `MikuDab`;
  }

  const dabEmoji = client.emojis.cache.find((emoji) => emoji.name === emojiName);

  if (dabEmoji) {
    interaction.channel.send(`${dabEmoji}`);
    replyHelper.interactionReply(interaction, {content: `Sent!`, ephemeral: true});
  } else {
    replyHelper.interactionReply(interaction, {content: `There was an error running the command.`, ephemeral: true});
  }
}

function getHelp() {
  return help;
}
