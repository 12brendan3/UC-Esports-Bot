const replyHelper = require(`../../helpers/reply-helper`);

// Exports
module.exports = {handle, getHelp};

// Help command text
const help = {
  text: `Provides a proper invite for the bot.`,
  level: `secret`,
};

// Exported functions
function handle(client, interaction) {
  replyHelper.interactionReply(interaction, {content: `Here's the link to invite the bot to a server:\nhttps://discord.com/api/oauth2/authorize?client_id=${client.user.id}&permissions=8&scope=bot%20applications.commands`, ephemeral: true});
}

function getHelp() {
  return help;
}
