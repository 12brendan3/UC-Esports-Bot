const Discord = require('discord.js');

const settings = require('../helpers/settings-manager');

// Exports
module.exports = {handle, getHelp};

// Help command text
const help =
'Provides information about the bot.';

// Exported functions
function handle(client, msg) {
  const embed = new Discord.MessageEmbed();

  embed.setTimestamp();
  embed.setColor('#FF0000');
  embed.setAuthor(client.user.username, client.user.displayAvatarURL());

  embed.addField('__About__', `The UC Esports bot is written in JS using the Discord.js library.\nSuggestions for the bot can be provided via the "${settings.getSettings().prefix}feedback" commmand.`);
  embed.addField('__Current Maintainers__', '• [Brendan Root](https://github.com/12brendan3)\n• [Baru Yogesh](https://github.com/BaruYogesh)');
  embed.addField('__Previous Contributors__', '• [Jordan Wentland](https://github.com/jordanwentland)');
  embed.addField('__Links__', '• [GitHub Repo](https://github.com/12brendan3/UC-Esports-Bot)');

  msg.channel.send(embed);
}

function getHelp() {
  return help;
}
