const settings = require(`../helpers/settings-manager`);
const modules = require(`../helpers/module-manager`);

// Exports
module.exports = {handle};

// Exported function
function handle(client, msg) {
  if (msg.content.startsWith(settings.getSettings().prefix)) {
    handleCommand(client, msg);
  }
}

// Private function
function handleCommand(client, msg) {
  console.info(`#${msg.channel.name} <${msg.author.username}> ${msg.content}`);

  let command = msg.content.substr(settings.getSettings().prefix.length);

  if (msg.content.includes(` `)) {
    command = command.split(` `)[0];
  }

  const commands = modules.getCommands();

  if (commands[command]) {
    commands[command].handle(client, msg);
  } else {
    msg.reply(`unknown command.`);
  }
}
