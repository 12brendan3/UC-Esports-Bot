const Discord = require(`discord.js`);

const bearcatManager = require(`../helpers/bearcat-manager`);

// Exports
module.exports = {handle, getHelp};

// Help command text
const help = {
  type: Discord.ApplicationCommandType.ChatInput,
  text: `Allows students to verify they go to UC and grants the verified role in servers.`,
  level: `user`,
  allowDM: true,
  options: [
    {
      name: `email`,
      type: Discord.ApplicationCommandOptionType.String,
      description: `The UC email to link and send a verification code to.`,
      required: false,
    },
    {
      name: `code`,
      type: Discord.ApplicationCommandOptionType.String,
      description: `The verification code sent to your UC email.`,
      required: false,
    },
  ],
};

// Exported functions
function handle(client, interaction) {
  bearcatManager.verifyUser(interaction);
}

function getHelp() {
  return help;
}
