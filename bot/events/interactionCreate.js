const modules = require(`../helpers/module-manager`);

// Exports
module.exports = {handle};

// Exported function
function handle(client, interaction) {
  if (interaction.isCommand()) {
    handleCommand(client, interaction);
  } else if (interaction.isButton()) {
    handleButton(client, interaction);
  }
}

function handleCommand(client, interaction) {
  // Ignore report command to keep it as anonymous as possible
  if (interaction.commandName !== `ticket`) {
    console.info(`${interaction.guildID === null ? `Via DM` : `#${interaction.channel.name}`} <${interaction.user.username}> ${interaction.commandName}`);
  }

  const commands = modules.getCommands();

  commands.get(interaction.commandName).handle(client, interaction);
}

function handleButton(client, interaction) {
  console.log(interaction);
}
