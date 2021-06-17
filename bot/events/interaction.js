const modules = require(`../helpers/module-manager`);

// Exports
module.exports = {handle};

// Exported function
async function handle(client, interaction) {
  if (!interaction.isCommand()) {
    return;
  }

  // Ignore report command to keep it as anonymous as possible
  if (interaction.commandName !== `ticket`) {
    console.info(`${interaction.guildID === null ? `Via DM` : `#${interaction.channel.name}`} <${interaction.user.username}> ${interaction.commandName}`);
  }

  const commands = modules.getCommands();

  commands[interaction.commandName].handle(client, interaction);
}
