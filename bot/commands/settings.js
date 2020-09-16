// Imports
const database = require(`../helpers/database-manager`);
const collectors = require(`../helpers/collectors`);
const resolvers = require(`../helpers/resolvers`);
const permissions = require("../helpers/permissions");

// Vars
const options = `Currently the only options are: "welcome-message" and "welcome-channel"`;
let activeChanges = [];

// Exports
module.exports = {handle, getHelp};

// Help command text
const help =
`Allows a server admin to change bot settings.`;

// Exported functions
async function handle(client, msg) {
  if (msg.channel.type === `dm`) {
    msg.reply(`this command has to be used in a server.`);
  } else {
    const admin = msg.guild.ownerID === msg.author.id ? 'true' : await permissions.checkAdmin(msg.guild);

    if (admin && activeChanges.includes(msg.guild.id)) {
      msg.reply(`only one change can be made at a time.`);
    } else if (admin) {
      activeChanges.push(msg.guild.id);
      const option = msg.content.split(' ');

      if (option.length > 1) {
        changeSettings(msg, option[1]);
      } else {
        msg.reply(`please provide a setting to change.\n${options}`);
        activeChanges = activeChanges.filter((val) => val !== msg.guild.id);
      }
    } else {
      msg.reply(`you're not an admin on this server.`);
    }
  }
}

function getHelp() {
  return help;
}

// Private functions
function changeSettings(msg, setting) {
  switch (setting) {
    case 'welcome-message':
      changeWelcomeMessage(msg);
      break;
    case 'welcome-channel':
      changeWelcomeChannel(msg);
      break;
    case 'admin-add':
      addAdmin(msg);
      break;
    case 'admin-remove':
      removeAdmin(msg);
      break;
    case 'admin-list':
      listAdmins(msg);
      break;
    default:
      activeChanges = activeChanges.filter((val) => val !== msg.guild.id);
      msg.reply(`invalid option.\n${options}`);
      break;
  }
}

async function changeWelcomeMessage(msg) {
  msg.reply(`please enter the new join message.  You can use !!newuser!! to mention the new user that has joined.`);

  try {
    const collected = await collectors.oneMessageFromUser(msg.channel, msg.author.id);

    const newMessage = collected.first().content;

    await database.updateOrCreateEntry(`Guilds`, {guildID: msg.guild.id}, {welcomeMessage: newMessage});

    msg.reply(`join message has been updated!\nUse the "test welcome-message" command to try it.`);
  } catch {
    msg.reply(`command timed out, please try again.`);
  }

  activeChanges = activeChanges.filter((val) => val !== msg.guild.id);
}

async function changeWelcomeChannel(msg) {
  msg.reply(`please provide the name or ID of the new welcome message channel.`);

  try {
    const collected = await collectors.oneMessageFromUser(msg.channel, msg.author.id);

    const newWelcomeChannelID = resolvers.resolveChannelID(msg.guild, collected.first().content);

    if (newWelcomeChannelID) {
      const result = await database.updateOrCreateEntry(`Guilds`, {guildID: msg.guild.id}, {welcomeChannelID: newWelcomeChannelID});

      console.log(result);

      msg.reply(`welcome message channel has been updated!\nUse the "test welcome-channel" command to try it.`);
    } else {
      msg.reply(`no channel found, please try again.`);
    }
  } catch (err) {
    console.error(err);
    msg.reply(`command timed out, please try again.`);
  }

  activeChanges = activeChanges.filter((val) => val !== msg.guild.id);
}

async function addAdmin(msg) {
  msg.reply(`please provide the name/ID of the new admin or mention them.`);

  try {
    const collected = await collectors.oneMessageFromUser(msg.channel, msg.author.id);

    console.log(collected.first().content);

    const newUserID = resolvers.resolveUserID(msg.guild, collected.first().content);

    if (newUserID) {
      const success = await permissions.addAdmin(msg.guild.id, newUserID);

      if (success && success === 'duplicate') {
        msg.reply(`that user is already an admin!`);
      } else if (success) {
        if (msg.guild.ownerID === newUserID && msg.author.id === msg.guild.ownerID) {
          msg.reply(`admin has been added!\nUse the "settings admin-list" command to see the current admins.\n*Not sure why you added yourself when you're the server owner...*`);
        } else if (msg.guild.ownerID === newUserID) {
          msg.reply(`admin has been added!\nUse the "settings admin-list" command to see the current admins.\n*Not sure why you added the server owner...*`);
        } else {
          msg.reply(`admin has been added!\nUse the "settings admin-list" command to see the current admins.`);
        }
      } else {
        msg.reply(`there was an error adding the new admin.  Tell the bot developers if the issue persists.`);
      }
    } else {
      msg.reply(`no user found, please try again.`);
    }
  } catch (err) {
    console.error(err);
    msg.reply(`command timed out, please try again.`);
  }

  activeChanges = activeChanges.filter((val) => val !== msg.guild.id);
}

async function removeAdmin(msg) {
  if (await sendAdminList(msg)) {
    msg.reply(`please provide the name/ID of the admin to remove or mention them.`);

    try {
      const collected = await collectors.oneMessageFromUser(msg.channel, msg.author.id);

      const removeUserID = resolvers.resolveUserID(msg.guild, collected.first().content);

      if (removeUserID) {
        const adminCheck = await permissions.removeAdmin(msg.guild.id, removeUserID);
        if (adminCheck && adminCheck === 'notadmin') {
          msg.reply(`that user isn't an admin!`);
        } else if (adminCheck) {
          if (msg.author.id === removeUserID) {
            msg.reply(`admin has been removed!\n*Not sure why you removed yourself...*`);
          } else {
            msg.reply(`admin has been removed!\nUse the "settings admin-list" command to see the current admins.`);
          }
        } else {
          msg.reply(`there was an error removing the admin.  Tell the bot developers if the issue persists.`);
        }
      } else {
        msg.reply(`no user found, please try again.`);
      }
    } catch (err) {
      console.error(err);
      msg.reply(`command timed out, please try again.`);
    }
  }

  activeChanges = activeChanges.filter((val) => val !== msg.guild.id);
}

async function sendAdminList(msg) {
  const admins = await permissions.getAdmins(msg.guild.id);

  if (admins && admins === `noadmins`) {
    msg.reply(`you're the only admin on this server.`);
    return false;
  } else if (admins) {
    let adminList = ``;

    for (let i = 0; admins.length > i; i++) {
      const adminMember = msg.guild.members.cache.get(admins[i].userID);
      adminList += `${adminMember ? adminMember.user.tag : admins[i]}\n`;
    }

    msg.reply(`here are the admins:\n\`\`\`${adminList}\`\`\`\nNote: The server owner is always an admin.`);
    return true;
  } else {
    msg.reply(`there was an error getting the admins.  Tell the bot developers if the issue persists.`);
    return false;
  }
}

async function listAdmins(msg) {
  await sendAdminList(msg);

  activeChanges = activeChanges.filter((val) => val !== msg.guild.id);
}
