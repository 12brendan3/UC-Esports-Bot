const Discord = require(`discord.js`);

const database = require(`../helpers/database-manager`);
const replyHelper = require(`../helpers/interaction-helper`);

// Exports
module.exports = {handle, getHelp};

// Help command text
const help = {
  type: Discord.ApplicationCommandType.Message,
  level: `user`,
  allowDM: false,
};

// Exported functions
async function handle(client, interaction) {
  if (interaction.targetType !== `MESSAGE`) {
    return;
  }

  const guildSettings = await database.getEntry(`Guilds`, {guildID: interaction.guildId});

  if (!guildSettings || !guildSettings.reportChannelID || (!guildSettings.starboardChannelID && interaction.channelId === guildSettings.starboardChannelID) || (!guildSettings.rolesChannelID && interaction.channelId === guildSettings.rolesChannelID)) {
    replyHelper.interactionReply(interaction, {content: `Failed to report message.  Is a report channel set up?`, ephemeral: true});
    return;
  }

  const message = await interaction.channel.messages.fetch(interaction.targetId);

  const newEmbed = generateReportEmbed(message, interaction.user);

  const repChannel = interaction.guild.channels.cache.get(guildSettings.reportChannelID);

  if (guildSettings.reportRoleID) {
    repChannel.send({content: `<@&${guildSettings.reportRoleID}>`, embeds: [newEmbed]});
  } else {
    repChannel.send({embeds: [newEmbed]});
  }

  replyHelper.interactionReply(interaction, {content: `Message has been flagged for review by admins.`, ephemeral: true});
}

function generateReportEmbed(msg, user) {
  const embed = new Discord.EmbedBuilder();

  embed.setDescription(`A message has been flagged.`);
  embed.setColor(`#FF0000`);
  embed.setAuthor({name: msg.author.tag, iconURL: msg.author.displayAvatarURL()});

  const embedFields = [];

  if (msg.content) {
    embedFields.push({ name: `Message`, value: msg.content.length > 1000 ? msg.content.substr(0, 1000) : msg.content });
  
    if (msg.content.length > 1000) {
      embedFields.push({ name: `*** ***`, value: msg.content.substr(1000, msg.content.length) });
    }
  }
  
  embedFields.push({ name: `Message Link`, value: `[View Message](${msg.url})` });

  embed.setFields(embedFields);

  embed.setFooter({text: user.tag, iconURL: user.displayAvatarURL()});
  embed.setTimestamp();

  return embed;
}

function getHelp() {
  return help;
}
