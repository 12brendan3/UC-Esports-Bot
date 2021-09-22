const replyHelper = require(`../../helpers/reply-helper`);

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
    replyHelper.interactionReply(interaction, {content: `Please provide something for the cat to say.`, ephemeral: true});
    return;
  }

  const text = encodeURI(interaction.options.get(`option1`).value);

  try {
    interaction.channel.send({files: [{attachment: `https://cataas.com/c/s/${text}`, name: `cat.jpeg`}]});
    replyHelper.interactionReply(interaction, {content: `Sent!`, ephemeral: true});
  } catch (err) {
    replyHelper.interactionReply(interaction, {content: `There was an error running the command.`, ephemeral: true});
    console.error(err);
  }
}

function getHelp() {
  return help;
}
