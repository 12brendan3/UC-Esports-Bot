const Discord = require(`discord.js`);

const replyHelper = require(`../../helpers/interaction-helper`);

// Exports
module.exports = {handle, getHelp};

// Help command text
const help = {
  text: `Sends a cat picture with the specified text.`,
  level: `secret`,
};

// Exported functions
function handle(client, interaction) {
  if (!interaction.options.get(`option1`)) {
    replyHelper.interactionReply(interaction, { content: `Please provide something for the cat to say.`, flags: Discord.MessageFlags.Ephemeral });
    return;
  }

  const text = encodeURI(interaction.options.get(`option1`).value);

  try {
    const nonce = Discord.SnowflakeUtil.generate();
    interaction.channel.send({ files: [{ attachment: `https://cataas.com/c/s/${text}`, name: `cat.jpeg` }], enforceNonce: true, nonce: nonce.toString() });
    replyHelper.interactionReply(interaction, { content: `Sent!`, flags: Discord.MessageFlags.Ephemeral });
  } catch (err) {
    replyHelper.interactionReply(interaction, { content: `There was an error running the command.`, flags: Discord.MessageFlags.Ephemeral });
    console.error(err);
  }
}

function getHelp() {
  return help;
}
