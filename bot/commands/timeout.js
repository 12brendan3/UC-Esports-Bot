const permissions = require(`../helpers/permissions`);
const timeouts = require(`../helpers/timeout-manager`);
const resolvers = require(`../helpers/resolvers`);
const database = require(`../helpers/database-manager`);

const regexTime = new RegExp(`^([0-9]*d)?([0-9]*h)?([0-9]*m)?$`);

// Exports
module.exports = {handle, getHelp};

// Help command text
const help = {
  text: `Allows an admin to put a user in timeout.`,
  level: `admin`,
};

// Exported functions
async function handle(client, msg) {
  if (msg.channel.type === `dm`) {
    msg.reply(`This command has to be used in a server.`);
    return;
  }

  let isAdmin = false;
  try {
    isAdmin = await permissions.checkAdmin(msg.guild, msg.author.id);
  } catch {
    msg.reply(`Command timed out, please try again.`);
    return;
  }

  if (!isAdmin) {
    msg.reply(`You're not an admin on this server.`);
    return;
  }

  const guildSettings = await database.getEntry(`Guilds`, {guildID: msg.guild.id});

  if (!guildSettings || !guildSettings.timeoutRoleID) {
    msg.reply(`There is no timeout role set up on this server.`);
    return;
  }

  const splitMsg = msg.content.split(` `);

  if (!splitMsg[1]) {
    msg.reply(`Please provide a user to timeout with your command.\nFormat: \`timeout <user> <time>\` - time is in the format: \`1d1h1m\`.`);
    return;
  } else if (!splitMsg[2]) {
    msg.reply(`Please provide a duration to timeout the user for with your command.\nFormat: \`timeout <user> <time>\` - time is in the format: \`1d1h1m\`.`);
    return;
  }

  const userID = resolvers.resolveUserID(msg.guild, splitMsg[1]);

  if (!userID) {
    msg.reply(`Failed to find that user, please try again.`);
    return;
  }

  const timeout = await database.getEntry(`Timeouts`, {guildID: msg.guild.id, userID});

  if (timeout) {
    msg.reply(`That user is already in timeout.`);
    return;
  }

  const time = parseTime(splitMsg[2]);

  if (!time) {
    msg.reply(`Failed to parse the timeout duration or the timeout is too long (max ~25 days), please try again.`);
    return;
  }

  const result = await timeouts.createOne(time, userID, msg.guild, guildSettings.timeoutRoleID);

  if (result) {
    msg.reply(result);
    return;
  }

  msg.reply(`<@${userID}> has been put in timeout for ${convertTime(time)}.`);
}

function parseTime(timeString) {
  const regExc = regexTime.exec(timeString);

  if (!regExc) {
    return false;
  }

  let time = 0;

  time += regExc[1] ? parseInt(regExc[1].slice(0, -1), 10) * 86400000 : 0;
  time += regExc[2] ? parseInt(regExc[2].slice(0, -1), 10) * 3600000 : 0;
  time += regExc[3] ? parseInt(regExc[3].slice(0, -1), 10) * 60000 : 0;

  return time;
}

function convertTime(ms) {
  let mins = Math.floor(ms / 60000);
  let hours = Math.floor(mins / 60);
  mins %= 60;
  const days = Math.floor(hours / 24);
  hours %= 24;

  return `${days}d${hours}h${mins}m`;
}

function getHelp() {
  return help;
}
