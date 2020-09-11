// Imports
const modules = require(`../helpers/module-manager`);

// Exports
module.exports = {handle, getHelp};

// Help command text
const help =
`This command :)`;

// Exported functions
function handle(client, msg) {
  let helpMessage = ``;
  const commands = modules.getCommands();

  for (const key of Object.keys(commands)) {
    helpMessage += `${key}; ${commands[key].getHelp()}\n`;
  }

  msg.channel.send(helpMessage);
}

function getHelp() {
  return help;
}
