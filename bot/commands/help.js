// Imports
const Discord = require(`discord.js`);

const modules = require(`../helpers/module-manager`);
const settings = require(`../helpers/settings-manager`);
const permissions = require(`../helpers/permissions`);

// Exports
module.exports = {handle, getHelp};

// Help command text
const help = {
  text: `This command :)`,
  level: `user`,
};

// Exported functions
async function handle(client, msg) {
  const commands = modules.getCommands();
  const embed = new Discord.MessageEmbed();
  const prefix = settings.getSettings().prefix;

  embed.setColor(`#FF00CC`);
  embed.setAuthor(client.user.username, client.user.displayAvatarURL());
  embed.setFooter(settings.version);

  const perms = [`user`];

  if (msg.channel.type === `dm`) {
    perms.push(`admin`);
  } else {
    const isAdmin = await permissions.checkAdmin(msg.guild.id, msg.author.id);

    if (isAdmin || msg.author.id === msg.guild.ownerID) {
      perms.push(`admin`);
    }
  }

  if (permissions.checkDev(msg.author.id)) {
    perms.push(`developer`);
  }

  for (const key of Object.keys(commands)) {
    const helpInfo = commands[key].getHelp();
    if (helpInfo) {
      embed.addField(`__${prefix}${key}__`, helpInfo.text);
    }
  }

  msg.channel.send(embed);
}

function getHelp() {
  return help;
}
