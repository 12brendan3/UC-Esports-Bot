// Imports
const Discord = require(`discord.js`);

const commandManager = require(`../helpers/command-manager`);
const replyHelper = require(`../helpers/interaction-helper`);

// Exports
module.exports = {handle, getHelp};

// Help command text
const help = {
  type: Discord.ApplicationCommandType.ChatInput,
  text: `Use a secret command... if you know the name of it.`,
  level: `user`,
  allowDM: true,
  options: [
    {
      name: `command`,
      description: `The name of the secret command to run.`,
      type: Discord.ApplicationCommandOptionType.String,
      required: true,
    },
    {
      name: `option1`,
      description: `First command option if it takes one.`,
      type: Discord.ApplicationCommandOptionType.String,
      required: false,
    },
  ],
};

// Exported functions
function handle(client, interaction) {
  const commands = commandManager.getAllSecret();
  const commandName = interaction.options.get(`command`).value;

  if (commands.has(commandName)) {
    commands.get(commandName).handle(client, interaction);
  } else {
    replyHelper.interactionReply(interaction, {content: `Sorry, that's not a valid secret command.`, ephemeral: true});
  }
}

function getHelp() {
  return help;
}
