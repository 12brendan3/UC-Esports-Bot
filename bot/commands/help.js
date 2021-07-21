// Imports
const Discord = require(`discord.js`);

const modules = require(`../helpers/module-manager`);
const settings = require(`../helpers/settings-manager`);
const permissions = require(`../helpers/permissions`);

// Exports
module.exports = {handle, getHelp};

// Help command text
const help = {
  text: `Sends a list of all commands you can use and the descriptions.`,
  level: `user`,
};

// Exported functions
async function handle(client, interaction) {
  const commands = modules.getCommands();
  const embed = new Discord.MessageEmbed();

  embed.setColor(`#FF00CC`);
  embed.setAuthor(client.user.username, client.user.displayAvatarURL());
  embed.setFooter(settings.version);

  const perms = [`user`];

  if (interaction.channel.type === `dm`) {
    perms.push(`admin`);
  } else {
    const isAdmin = await permissions.checkAdmin(interaction.guild, interaction.user.id);

    if (isAdmin) {
      perms.push(`admin`);
    }
  }

  if (permissions.checkDev(interaction.user.id)) {
    perms.push(`developer`);
  }

  for (const command of commands.keys()) {
    const helpInfo = commands.get(command).getHelp();
    if (helpInfo && perms.includes(helpInfo.level)) {
      embed.addField(`__${command}__`, helpInfo.text);
    }
  }

  interaction.reply({embeds: [embed], ephemeral: true});
}

function getHelp() {
  return help;
}
