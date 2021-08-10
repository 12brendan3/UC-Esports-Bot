const permissions = require(`../helpers/permissions`);
const timeouts = require(`../helpers/timeout-manager`);
const resolvers = require(`../helpers/resolvers`);
const database = require(`../helpers/database-manager`);

// Exports
module.exports = {handle, getHelp};

// Help command text
const help = {
  text: `Allows an admin to remove a user from timeout.`,
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
    msg.reply(`Please provide a user to pardon with your command.\nFormat: \`pardon <user>\``);
    return;
  }

  const userID = resolvers.resolveUserID(msg.guild, splitMsg[1]);

  if (!userID) {
    msg.reply(`Failed to find that user, please try again.`);
    return;
  }

  const member = msg.guild.members.cache.get(userID);

  if (!member) {
    msg.reply(`Failed to find that user, please try again.`);
    return;
  }

  const timeout = await database.getEntry(`Timeouts`, {guildID: msg.guild.id, userID});

  if (!timeout) {
    msg.reply(`That user isn't in timeout.`);
    return;
  }

  const result = await timeouts.removeOne(timeout.ID, member, guildSettings.timeoutRoleID);

  if (!result) {
    msg.reply(`There was an internal error, let the bot devs know if the error persists.`);
    return;
  }

  msg.reply(`<@${userID}> has been pardoned.`);
}

function getHelp() {
  return help;
}
