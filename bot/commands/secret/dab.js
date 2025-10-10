const Discord = require(`discord.js`);

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
    const nonce = Discord.SnowflakeUtil.generate();
    interaction.channel.send({ content: `${dabEmoji}`, enforceNonce: true, nonce: nonce.toString() });
    replyHelper.interactionReply(interaction, { content: `Sent!`, flags: Discord.MessageFlags.Ephemeral });
  } else {
    replyHelper.interactionReply(interaction, { content: `There was an error running the command.`, flags: Discord.MessageFlags.Ephemeral });
  }
}

function getHelp() {
  return help;
}
