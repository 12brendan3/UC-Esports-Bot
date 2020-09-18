// Imports
const Discord = require(`discord.js`);

const modules = require(`../helpers/module-manager`);
const settings = require(`../helpers/settings-manager`);

// Exports
module.exports = {handle, getHelp};

// Help command text
const help =
`This command :)`;

// Exported functions
function handle(client, msg) {
  const commands = modules.getCommands();
  const embed = new Discord.MessageEmbed();
  const prefix = settings.getSettings().prefix;

  embed.setColor(`#FF00CC`);
  embed.setAuthor(client.user.username, client.user.displayAvatarURL());
  embed.setFooter(settings.version);

  for (const key of Object.keys(commands)) {
    if (commands[key].getHelp()) {
      embed.addField(`__${prefix}${key}__`, commands[key].getHelp());
    }
  }

  msg.channel.send(embed);
}

function getHelp() {
  return help;
}
