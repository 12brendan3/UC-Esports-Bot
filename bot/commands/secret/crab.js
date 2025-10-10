const Discord = require(`discord.js`);

const replyHelper = require(`../../helpers/interaction-helper`);

// Exports
module.exports = {handle, getHelp};

// Help command text
const help = {
  text: `Sends a crab emoji in chat.`,
  level: `secret`,
};

// Exported functions
function handle(client, interaction) {
  const nonce = Discord.SnowflakeUtil.generate();
  interaction.channel.send({ content: `🦀`, enforceNonce: true, nonce: nonce.toString() });
  replyHelper.interactionReply(interaction, { content: `Sent!`, flags: Discord.MessageFlags.Ephemeral });
}

function getHelp() {
  return help;
}
