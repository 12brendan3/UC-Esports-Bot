const replyHelper = require(`../../helpers/reply-helper`);

// Exports
module.exports = {handle, getHelp};

// Help command text
const help = {
  text: `Sends a cat gif in chat.`,
  level: `secret`,
};

// Exported functions
function handle(client, interaction) {
  try {
    interaction.channel.send({files: [{attachment: `https://cataas.com/c/gif`, name: `cat.gif`}]});
    replyHelper.interactionReply(interaction, {content: `Sent!`, ephemeral: true});
  } catch (err) {
    replyHelper.interactionReply(interaction, {content: `There was an error running the command.`, ephemeral: true});
    console.error(err);
  }
}

function getHelp() {
  return help;
}
