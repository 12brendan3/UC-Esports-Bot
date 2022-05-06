const Discord = require(`discord.js`);

const settings = require(`../helpers/settings-manager`);
const formatters = require(`../helpers/formatters`);
const replyHelper = require(`../helpers/interaction-helper`);

// Exports
module.exports = {handle, getHelp};

// Help command text
const help = {
  text: `Provides information about the bot.`,
  level: `user`,
  allowDM: true,
};

// Exported functions
function handle(client, interaction) {
  const embed = new Discord.MessageEmbed();

  embed.setTimestamp();
  embed.setColor(`#FF7700`);
  embed.setAuthor({name: client.user.username, iconURL: client.user.displayAvatarURL()});

  embed.addField(`__About__`, `The UC Esports bot is written in JS using the Discord.js library.\nSuggestions for the bot can be provided via the "feedback" commmand.\nThe bot is currently in ${client.guilds.cache.size} servers watching over ${formatters.formatNumber(client.users.cache.size)} users.`);
  embed.addField(`__Current Maintainers__`, `• [Brendan Root](https://github.com/12brendan3)\n• [Tim Einhouse](https://github.com/murasa-minamitsu)`);
  embed.addField(`__Previous Contributors__`, `• [Jordan Wentland](https://github.com/jordanwentland)\n• [Baru Yogesh](https://github.com/BaruYogesh)`);
  embed.addField(`__Links__`, `• [GitHub Repo](https://github.com/12brendan3/UC-Esports-Bot)`);

  embed.setFooter({text: settings.version});

  replyHelper.interactionReply(interaction, {embeds: [embed]});
}

function getHelp() {
  return help;
}
