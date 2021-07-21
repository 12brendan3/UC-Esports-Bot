const modules = require(`../helpers/module-manager`);
const database = require(`../helpers/database-manager`);

// Exports
module.exports = {handle, getHelp};

// Help command text
const help = {
  text: `Unlock secret commands by entering their names.`,
  level: `user`,
  options: [
    {
      name: `command`,
      type: `STRING`,
      description: `The name of the secret command.`,
      required: true,
    },
  ],
};

// Exported functions
async function handle(client, interaction) {
  const command = interaction.options.get(`command`).value;
  if (!modules.getSecretCommands().has(command)) {
    interaction.reply({content: `That's not a valid secret command, try again.`, ephemeral: true});
    return;
  }

  const currentResult = await database.getEntry(`SecretCommands`, {userID: interaction.user.id, commandName: command});

  if (currentResult) {
    interaction.reply({content: `You already have that command unlocked.`, ephemeral: true});
  } else {
    await database.createEntry(`SecretCommands`, {userID: interaction.user.id, commandName: command});
    interaction.reply({content: `Congrats!  You now have access to \`/${command}\`!`, ephemeral: true});
  }
}

function getHelp() {
  return help;
}
