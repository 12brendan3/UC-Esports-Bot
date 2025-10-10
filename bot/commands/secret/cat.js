const Discord = require(`discord.js`);

const replyHelper = require(`../../helpers/interaction-helper`);

// Exports
module.exports = {handle, getHelp};

// Help command text
const help = {
  text: `Sends a cat image in chat.`,
  level: `secret`,
};

// Exported functions
function handle(client, interaction) {
  try {
    const nonce = Discord.SnowflakeUtil.generate();
    interaction.channel.send({ files: [{ attachment: `https://cataas.com/c`, name: `cat.jpeg` }], enforceNonce: true, nonce: nonce.toString() });
    replyHelper.interactionReply(interaction, { content: `Sent!`, flags: Discord.MessageFlags.Ephemeral });
  } catch (err) {
    replyHelper.interactionReply(interaction, { content: `There was an error running the command.`, flags: Discord.MessageFlags.Ephemeral });
    console.error(err);
  }
}

function getHelp() {
  return help;
}
