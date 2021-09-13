const commandManager = require(`../helpers/command-manager`);

// Exports
module.exports = {handle};

// Exported function
async function handle(client, guild) {
  commandManager.addOwnerToGuildCommand(client, guild);
}
