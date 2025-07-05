// Imports
const Discord = require(`discord.js`);

const commandManager = require(`../../helpers/command-manager`);
const settings = require(`../../helpers/settings-manager`);
const permissions = require(`../../helpers/permissions`);
const replyHelper = require(`../../helpers/interaction-helper`);

// Exports
module.exports = {handle, getHelp};

// Help command text
const help = {
  text: `Sends a list of all commands you can use and the descriptions.`,
  level: `user`,
};

// Exported functions
async function handle(client, interaction) {
  const commands = commandManager.getAll();
  const embed = new Discord.EmbedBuilder();

  embed.setColor(`#FF00CC`);

  embed.setAuthor({name: client.user.username, iconURL: client.user.displayAvatarURL()});

  embed.setFooter({text: settings.version});

  const perms = [`user`];

  if (!interaction.channel) {
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

  const embedFields = [];

  for (const command of commands.keys()) {
    const helpInfo = commands.get(command).getHelp();
    if (helpInfo && perms.includes(helpInfo.level)) {
      embedFields.push({ name: `__${command}__`, value: helpInfo.text });
    }
  }

  embed.setFields(embedFields);

  replyHelper.interactionReply(interaction, {embeds: [embed], ephemeral: true});
}

function getHelp() {
  return help;
}
