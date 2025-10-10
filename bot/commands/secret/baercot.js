const Discord = require(`discord.js`);

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

  if (baercotEmoji) {
    const nonce = Discord.SnowflakeUtil.generate();
    interaction.channel.send({ content: `${baercotEmoji}`, enforceNonce: true, nonce: nonce.toString() });
    replyHelper.interactionReply(interaction, { content: `Sent!`, flags: Discord.MessageFlags.Ephemeral });
  } else {
    replyHelper.interactionReply(interaction, { content: `There was an error running the command.`, flags: Discord.MessageFlags.Ephemeral });
  }
}

function getHelp() {
  return help;
}
