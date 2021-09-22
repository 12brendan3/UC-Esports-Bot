const replyHelper = require(`../../helpers/reply-helper`);

// Exports
module.exports = {handle, getHelp};

// Help command text
const help = {
  text: `Sends a crab emoji in chat.`,
  level: `secret`,
};

// Exported functions
function handle(client, interaction) {
  interaction.channel.send(`🦀`);
  replyHelper.interactionReply(interaction, {content: `Sent!`, ephemeral: true});
}

function getHelp() {
  return help;
}
