const database = require(`../helpers/database-manager`);
const collectors = require(`../helpers/collectors`);
const resolvers = require("../helpers/resolvers");

const Discord = require(`discord.js`);

const activeReports = new Set();

// Exports
module.exports = {handle, getHelp};

// Help command text
const help = {
  text: `Allows a user to submit a ticket for a specific server.`,
  level: `user`,
};

// Exported functions
async function handle(client, msg) {
  let DMChannel;
  let startedFromDM = false;
  let guildID;

  if (activeReports.has(msg.author.id)) {
    msg.reply(`You already have an active ticket in progress.`);
    return;
  }

  activeReports.add(msg.author.id);

  if (msg.channel.type === `dm`) {
    DMChannel = msg.channel;
    startedFromDM = true;
  } else {
    if (msg.deletable) {
      msg.delete();
    }
    guildID = msg.guild.id;
    DMChannel = await msg.author.createDM();
  }

  if (startedFromDM) {
    const guildList = client.guilds.cache.filter((guild) => guild.members.cache.has(msg.author.id));
    let guildString = ``;

    guildList.forEach((guild) => {
      guildString += `\`${guild.name}\` `;
    });

    DMChannel.send(`First of all, what server would you like to submit a ticket to?  Servers shared with you are:\n${guildString}`);

    let guildResponse;
    try {
      guildResponse = await collectors.oneMessageFromUser(DMChannel, msg.author.id, 60000);
    } catch {
      DMChannel.send(`Command timed out, please try again.`);
      activeReports.delete(msg.author.id);
      return;
    }

    const foundGuildID = resolvers.resolveGuildID(client, guildResponse.first().content);

    if (foundGuildID) {
      guildID = foundGuildID;
    } else {
      DMChannel.send(`Couldn't find that server, please try again.`);
      activeReports.delete(msg.author.id);
      return;
    }
  }

  const guildSettings = await database.getEntry(`Guilds`, {guildID});

  if (guildSettings && guildSettings.reportChannelID) {
    DMChannel.send(`Would you like this ticket to be anonymous? (yes/no)`);

    let anonResponse;

    try {
      anonResponse = await collectors.oneMessageFromUser(DMChannel, msg.author.id, 60000);
    } catch {
      DMChannel.send(`Command timed out, please try again.`);
      activeReports.delete(msg.author.id);
      return;
    }

    let anonymous = false;

    if (anonResponse.first().content === `yes`) {
      anonymous = true;
      DMChannel.send(`The ticket *will* be anonymous.\nWhat would you like to say in the ticket?\nType "cancel" to cancel this ticket.`);
    } else {
      DMChannel.send(`The ticket *will not* be anonymous.\nWhat would you like to say in the ticket?\nType "cancel" to cancel this ticket.`);
    }

    let reportText;

    try {
      reportText = await collectors.oneMessageFromUser(DMChannel, msg.author.id, 600000);
    } catch {
      DMChannel.send(`Command timed out, please try again.`);
      activeReports.delete(msg.author.id);
      return;
    }

    if (reportText.first().content === `cancel`) {
      DMChannel.send(`Report cancelled.`);
      activeReports.delete(msg.author.id);
      return;
    }

    const reportEmbed = generateReportEmbed(reportText.first().content, msg, anonymous);

    const reportGuild = client.guilds.cache.get(guildID);
    const reportChannel = reportGuild.channels.cache.get(guildSettings.reportChannelID);

    reportChannel.send(reportEmbed);

    DMChannel.send(`The ticket has been sent.`);
    activeReports.delete(msg.author.id);
  } else {
    DMChannel.send(`That server doesn't have a ticket channel set up.  Ticket cancelled.`);
    activeReports.delete(msg.author.id);
  }
}

function generateReportEmbed(text, msg, anonymous) {
  const embed = new Discord.MessageEmbed();

  embed.setDescription(`A ticket has been submitted.`);
  embed.setColor(`#FFFB1F`);
  if (anonymous) {
    embed.setAuthor(`Anonymous`);
  } else {
    embed.setAuthor(msg.author.tag, msg.author.displayAvatarURL());
  }
  embed.addField(`Message`, text);
  embed.setTimestamp();

  return embed;
}

function getHelp() {
  return help;
}
