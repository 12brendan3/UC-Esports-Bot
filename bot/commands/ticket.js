const database = require(`../helpers/database-manager`);
const collectors = require(`../helpers/collectors`);
const resolvers = require(`../helpers/resolvers`);
const replyHelper = require(`../helpers/interaction-helper`);

const Discord = require(`discord.js`);

const activeReports = new Set();

// Exports
module.exports = {handle, getHelp};

// Help command text
const help = {
  text: `Submit a ticket for a specific server.`,
  level: `user`,
  allowDM: true,
  options: [
    {
      name: `message`,
      type: `STRING`,
      description: `The message on the ticket.`,
      required: true,
    },
    {
      name: `anonymous`,
      type: `BOOLEAN`,
      description: `Whether or not the ticket is anonymous.`,
      required: true,
    },
  ],
};

// Exported functions
async function handle(client, interaction) {
  let startedFromDM = false;
  let guildID;

  if (activeReports.has(interaction.user.id)) {
    replyHelper.interactionReply(interaction, {content: `You already have an active ticket in progress.`, ephemeral: true});
    return;
  }

  activeReports.add(interaction.user.id);

  if (interaction.channel.type === `DM`) {
    startedFromDM = true;
    const guildList = client.guilds.cache.filter((guild) => guild.members.cache.has(interaction.user.id));
    let guildString = ``;

    guildList.forEach((guild) => {
      guildString += `\`${guild.name}\` `;
    });

    replyHelper.interactionReply(interaction, `What server would you like to submit this ticket to?  Servers shared with you are:\n${guildString}`);

    let guildResponse;
    try {
      guildResponse = await collectors.oneMessageFromUser(interaction.channel, interaction.user.id, 60000);
    } catch {
      interaction.followUp(`Command timed out, please try again.`);
      activeReports.delete(interaction.user.id);
      return;
    }

    const foundGuildID = resolvers.resolveGuildID(client, guildResponse.first().content);

    if (foundGuildID) {
      guildID = foundGuildID;
    } else {
      interaction.followUp(`Couldn't find that server, please try again.`);
      activeReports.delete(interaction.user.id);
      return;
    }
  } else {
    guildID = interaction.guildId;
  }

  const guildSettings = await database.getEntry(`Guilds`, {guildID});

  if (guildSettings && guildSettings.reportChannelID) {
    const reportEmbed = generateReportEmbed(interaction.options.get(`message`).value, interaction, interaction.options.get(`anonymous`).value);

    const reportGuild = client.guilds.cache.get(guildID);
    const reportChannel = reportGuild.channels.cache.get(guildSettings.reportChannelID);

    reportChannel.send({embeds: [reportEmbed]});

    if (startedFromDM) {
      interaction.followUp(`The ticket has been sent.`);
    } else {
      replyHelper.interactionReply(interaction, {content: `The ticket has been sent.`, ephemeral: true});
    }

    activeReports.delete(interaction.user.id);
  } else {
    if (startedFromDM) {
      interaction.followUp(`The server doesn't have a ticket channel set up.  Ticket cancelled.`);
    } else {
      replyHelper.interactionReply(interaction, {content: `The server doesn't have a ticket channel set up.  Ticket cancelled.`, ephemeral: true});
    }

    activeReports.delete(interaction.user.id);
  }
}

function generateReportEmbed(text, interaction, anonymous) {
  const embed = new Discord.MessageEmbed();

  embed.setDescription(`A ticket has been submitted.`);
  embed.setColor(`#FFFB1F`);
  if (anonymous) {
    embed.setAuthor({name: `Anonymous`});
  } else {
    embed.setAuthor({name: interaction.user.username, iconURL: interaction.user.displayAvatarURL()});
  }
  embed.addField(`Message`, text.length > 1000 ? text.substr(0, 1000) : text);
  if (text.length > 1000) {
    embed.addField(`*** ***`, text.substr(1000, text.length));
  }
  embed.setTimestamp();

  return embed;
}

function getHelp() {
  return help;
}
