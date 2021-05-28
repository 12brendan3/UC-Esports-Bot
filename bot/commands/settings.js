// Imports
const database = require(`../helpers/database-manager`);
const collectors = require(`../helpers/collectors`);
const resolvers = require(`../helpers/resolvers`);
const permissions = require(`../helpers/permissions`);
const reactManager = require(`../helpers/role-react-manager-2`);
const settings = require(`../helpers/settings-manager`);

// Vars
const options = `\n__Valid settings are:__\n\`welcome-message\`, \`welcome-channel\`, \`admin-add\`, \`admin-remove\`, \`admin-list\`, \`logs-channel\`, \`starboard-channel\`, \`starboard-threshold\`, \`streaming-role\`, \`react-channel\`, \`react-add\`, \`react-remove\`, \`react-update\`, \`react-cat-name\`, \`react-cat-info\`, \`react-verify\`, \`verified-role\`, \`report-channel\`, and \`report-role\``;
let activeChanges = [];

// Exports
module.exports = {handle, getHelp};

// Help command text
const help = {
  text: `Allows a server admin to change bot settings.`,
  level: `admin`,
};

// Exported functions
async function handle(client, msg) {
  if (msg.channel.type === `dm`) {
    msg.reply(`That command has to be used in a server.`);
    return;
  }

  const admin = await permissions.checkAdmin(msg.guild, msg.author.id);

  if (admin && activeChanges.includes(msg.guild.id)) {
    msg.reply(`Only one change can be made at a time.`);
  } else if (admin) {
    activeChanges.push(msg.guild.id);
    const option = msg.content.split(` `);

    if (option.length > 1) {
      changeSettings(msg, option[1], client);
    } else {
      msg.reply(`Please provide a setting to change with your command.\n${options}`);
      activeChanges = activeChanges.filter((val) => val !== msg.guild.id);
    }
  } else {
    msg.reply(`You're not an admin on this server.`);
  }
}

function getHelp() {
  return help;
}

// Private functions
function changeSettings(msg, setting, client) {
  switch (setting) {
    case `welcome-message`:
      changeWelcomeMessage(msg);
      break;
    case `welcome-channel`:
      changeWelcomeChannel(msg);
      break;
    case `admin-add`:
      addAdmin(msg);
      break;
    case `admin-remove`:
      removeAdmin(msg, client);
      break;
    case `admin-list`:
      listAdmins(msg, client);
      break;
    case `logs-channel`:
      changeLogsChannel(msg);
      break;
    case `starboard-channel`:
      changeStarboardChannel(msg);
      break;
    case `starboard-threshold`:
      changeStarboardThreshold(msg);
      break;
    case `streaming-role`:
      changeStreamingRole(msg);
      break;
    case `react-channel`:
      changeRoleChannel(msg, client);
      break;
    case `react-add`:
      addRoleReaction(msg, client);
      break;
    case `react-remove`:
      removeRoleReaction(msg, client);
      break;
    case `react-update`:
      updateRoleReactions(msg, client);
      break;
    case `react-cat-name`:
      updateCategoryName(msg, client);
      break;
    case `react-cat-info`:
      updateCategoryInfo(msg, client);
      break;
    case `react-verify`:
      verifyReactRoles(msg, client);
      break;
    case `verified-role`:
      changeVerifiedRole(msg);
      break;
    case `report-channel`:
      changeReportChannel(msg);
      break;
    case `report-role`:
      changeReportRole(msg);
      break;
    default:
      activeChanges = activeChanges.filter((val) => val !== msg.guild.id);
      msg.reply(`That's not a valid setting.\n${options}`);
      break;
  }
}

async function changeWelcomeMessage(msg) {
  msg.reply(`Please enter the new join message.  You can use !!newuser!! to mention the new user that has joined.`);

  try {
    const collected = await collectors.oneMessageFromUser(msg.channel, msg.author.id);

    const newMessage = collected.first().content;

    const result = await database.updateOrCreateEntry(`Guilds`, {guildID: msg.guild.id}, {welcomeMessage: newMessage});

    if (result) {
      msg.reply(`Join message has been updated!\nUse "${settings.getSettings().prefix}test welcome-message" to try it.`);
    } else {
      msg.reply(`There was an error saving the new welcome message.\nTell the bot developers if the issue persists.`);
    }
  } catch {
    msg.reply(`Command timed out, please try again.`);
  }

  activeChanges = activeChanges.filter((val) => val !== msg.guild.id);
}

async function changeWelcomeChannel(msg) {
  msg.reply(`Please provide the name/ID of the new welcome message channel or mention it.\nIf you'd like to disable the welcome message, just send \`disable\`.`);

  try {
    const collected = await collectors.oneMessageFromUser(msg.channel, msg.author.id);

    if (collected.first().content === `disable`) {
      const result = await database.updateEntry(`Guilds`, {guildID: msg.guild.id}, {welcomeChannelID: null});

      if (result) {
        msg.reply(`The welcome message has been disabled.\nUse "${settings.getSettings().prefix}test welcome-channel" to try it.`);
      } else {
        msg.reply(`There was an error disabling the welcome message.\nTell the bot developers if the issue persists.`);
      }
    } else {
      const newWelcomeChannelID = resolvers.resolveChannelID(msg.guild, collected.first().content);

      if (newWelcomeChannelID) {
        const result = await database.updateOrCreateEntry(`Guilds`, {guildID: msg.guild.id}, {welcomeChannelID: newWelcomeChannelID});

        if (result) {
          msg.reply(`Welcome message channel has been updated!\nUse "${settings.getSettings().prefix}test welcome-channel" to try it.`);
        } else {
          msg.reply(`There was an error updating the welcome message channel.\nTell the bot developers if the issue persists.`);
        }
      } else {
        msg.reply(`No channel found, please try again.`);
      }
    }
  } catch {
    msg.reply(`Command timed out, please try again.`);
  }

  activeChanges = activeChanges.filter((val) => val !== msg.guild.id);
}

async function addAdmin(msg) {
  msg.reply(`Please provide the name/ID of the new admin or mention them.`);

  try {
    const collected = await collectors.oneMessageFromUser(msg.channel, msg.author.id);

    const newUserID = resolvers.resolveUserID(msg.guild, collected.first().content);

    if (newUserID) {
      const success = await permissions.addAdmin(msg.guild, newUserID);

      if (success && success === `duplicate`) {
        msg.reply(`That user is already an admin!`);
      } else if (success) {
        if (msg.guild.ownerID === newUserID && msg.author.id === msg.guild.ownerID) {
          msg.reply(`Admin has been added!\nUse "${settings.getSettings().prefix}settings admin-list" to see the current admins.\n*Not sure why you added yourself when you're the server owner...*`);
        } else if (msg.guild.ownerID === newUserID) {
          msg.reply(`Admin has been added!\nUse "${settings.getSettings().prefix}settings admin-list" to see the current admins.\n*Not sure why you added the server owner...*`);
        } else {
          msg.reply(`Admin has been added!\nUse "${settings.getSettings().prefix}settings admin-list" to see the current admins.`);
        }
      } else {
        msg.reply(`There was an error adding the new admin.\nTell the bot developers if the issue persists.`);
      }
    } else {
      msg.reply(`No user found, please try again.`);
    }
  } catch {
    msg.reply(`Command timed out, please try again.`);
  }

  activeChanges = activeChanges.filter((val) => val !== msg.guild.id);
}

async function removeAdmin(msg, client) {
  if (await sendAdminList(msg, client)) {
    msg.channel.send(`Please provide the name/ID of the admin to remove or mention them.`);

    try {
      const collected = await collectors.oneMessageFromUser(msg.channel, msg.author.id);

      const removeUserID = resolvers.resolveUserID(msg.guild, collected.first().content);

      if (removeUserID) {
        const adminCheck = await permissions.removeAdmin(msg.guild.id, removeUserID);
        if (adminCheck && adminCheck === `notadmin`) {
          msg.reply(`That user isn't an admin!`);
        } else if (adminCheck) {
          if (msg.author.id === removeUserID) {
            msg.reply(`Admin has been removed!\n*Not sure why you removed yourself...*`);
          } else {
            msg.reply(`Admin has been removed!\nUse "${settings.getSettings().prefix}settings admin-list" to see the current admins.`);
          }
        } else {
          msg.reply(`There was an error removing the admin.\nTell the bot developers if the issue persists.`);
        }
      } else {
        msg.reply(`No user found, please try again.`);
      }
    } catch {
      msg.reply(`Command timed out, please try again.`);
    }
  }

  activeChanges = activeChanges.filter((val) => val !== msg.guild.id);
}

async function sendAdminList(msg, client) {
  const admins = await permissions.getAdmins(msg.guild);

  if (admins && admins === `noadmins`) {
    msg.reply(`You're the only admin on this server.`);
    return false;
  } else if (admins) {
    let adminList = ``;

    for (let i = 0; i < admins.length; i++) {
      const adminUser = client.users.cache.get(admins[i].userID);
      if (adminUser) {
        adminList += `${adminUser.tag}\n`;
      } else {
        adminList += `${admins[i].userID} (Unknown User)\n`;
      }
    }

    msg.reply(`Here are the admins:\n\`\`\`${adminList}\`\`\`\nNote: The server owner and developers are always admins.`);
    return true;
  } else {
    msg.reply(`There was an error getting the admins.\nTell the bot developers if the issue persists.`);
    return false;
  }
}

async function listAdmins(msg, client) {
  await sendAdminList(msg, client);

  activeChanges = activeChanges.filter((val) => val !== msg.guild.id);
}

async function changeLogsChannel(msg) {
  msg.reply(`Please provide the name/ID of the new logs channel or mention it.\nIf you'd like to disable logs, just send \`disable\`.`);

  try {
    const collected = await collectors.oneMessageFromUser(msg.channel, msg.author.id);

    if (collected.first().content === `disable`) {
      const result = await database.updateEntry(`Guilds`, {guildID: msg.guild.id}, {logsChannelID: null});

      if (result) {
        msg.reply(`The logs have been disabled.\nUse "${settings.getSettings().prefix}test logs-channel" to try it.`);
      } else {
        msg.reply(`There was an error disabling logs.\nTell the bot developers if the issue persists.`);
      }
    } else {
      const newLogChannelID = resolvers.resolveChannelID(msg.guild, collected.first().content);

      if (newLogChannelID) {
        const result = await database.updateOrCreateEntry(`Guilds`, {guildID: msg.guild.id}, {logsChannelID: newLogChannelID});

        if (result) {
          msg.reply(`Logs channel has been updated!\nUse "${settings.getSettings().prefix}test logs-channel" to try it.`);
        } else {
          msg.reply(`There was an error updating the logs channel.\nTell the bot developers if the issue persists.`);
        }
      } else {
        msg.reply(`No channel found, please try again.`);
      }
    }
  } catch {
    msg.reply(`Command timed out, please try again.`);
  }

  activeChanges = activeChanges.filter((val) => val !== msg.guild.id);
}

async function changeStarboardChannel(msg) {
  msg.reply(`Please provide the name/ID of the new starboard channel or mention it.\nIf you'd like to disable the starboard, just send \`disable\`.`);

  try {
    const collected = await collectors.oneMessageFromUser(msg.channel, msg.author.id);

    const newStarboardChannelID = resolvers.resolveChannelID(msg.guild, collected.first().content);

    if (collected.first().content === `disable`) {
      const result = await database.updateEntry(`Guilds`, {guildID: msg.guild.id}, {starboardChannelID: null});

      if (result) {
        msg.reply(`The starboard has been disabled.`);
      } else {
        msg.reply(`There was an error disabling the starboard.`);
      }
    } else if (newStarboardChannelID) {
      let threshold = 5;
      const currentSettings = await database.getEntry(`Guilds`, {guildID: msg.guild.id});

      if (currentSettings && currentSettings.starboardThreshold) {
        threshold = currentSettings.starboardThreshold;
      }

      const result = await database.updateOrCreateEntry(`Guilds`, {guildID: msg.guild.id}, {starboardChannelID: newStarboardChannelID, starboardThreshold: threshold});

      if (result) {
        msg.reply(`Starboard channel has been updated!\nThe default starboard threshold is 5 reactions.  Use "${settings.getSettings().prefix}settings starboard-threshold" to change it.`);
      } else {
        msg.reply(`There was an error updating the starboard channel.\nTell the bot developers if the issue persists.`);
      }
    } else {
      msg.reply(`No channel found, please try again.`);
    }
  } catch {
    msg.reply(`Command timed out, please try again.`);
  }

  activeChanges = activeChanges.filter((val) => val !== msg.guild.id);
}

async function changeStarboardThreshold(msg) {
  msg.reply(`Please provide the new number of reactions needed.\nIf you'd like to disable the starboard, just send \`disable\`.`);

  try {
    const collected = await collectors.oneMessageFromUser(msg.channel, msg.author.id);

    const newNum = parseInt(collected.first().content, 10);

    if (collected.first().content === `disable`) {
      const result = await database.updateEntry(`Guilds`, {guildID: msg.guild.id}, {starboardChannelID: null});

      if (result) {
        msg.reply(`The starboard has been disabled.`);
      } else {
        msg.reply(`There was an error disabling the starboard.`);
      }
    } else if (isNaN(newNum) && (newNum < 1 && newNum > 1000)) {
      msg.reply(`That's an invalid number, please try again.`);
    } else {
      const result = await database.updateOrCreateEntry(`Guilds`, {guildID: msg.guild.id}, {starboardThreshold: newNum});

      if (result) {
        msg.reply(`starboard threshold has been updated!\nMake sure you have a starboard channel set!  Use "${settings.getSettings().prefix}settings starboard-channel" to change it.`);
      } else {
        msg.reply(`There was an error updating the starboard channel.\nTell the bot developers if the issue persists.`);
      }
    }
  } catch {
    msg.reply(`Command timed out, please try again.`);
  }

  activeChanges = activeChanges.filter((val) => val !== msg.guild.id);
}

async function changeStreamingRole(msg) {
  msg.reply(`Please provide the name/ID of the role or mention it.\nIf you'd like to disable the streaming role, just send \`disable\`.`);

  try {
    const collected = await collectors.oneMessageFromUser(msg.channel, msg.author.id);

    const newRoleID = resolvers.resolveRoleID(msg.guild, collected.first().content);

    if (collected.first().content === `disable`) {
      const result = await database.updateEntry(`Guilds`, {guildID: msg.guild.id}, {streamingRoleID: null});

      if (result) {
        msg.reply(`The streaming role has been disabled.`);
      } else {
        msg.reply(`There was an error disabling the streaming role.`);
      }
    } else if (newRoleID) {
      const result = await database.updateOrCreateEntry(`Guilds`, {guildID: msg.guild.id}, {streamingRoleID: newRoleID});

      if (result) {
        msg.reply(`Streaming role has been updated!`);
      } else {
        msg.reply(`There was an error updating the streaming role.\nTell the bot developers if the issue persists.`);
      }
    } else {
      msg.reply(`That's an invalid role, please try again.`);
    }
  } catch {
    msg.reply(`Command timed out, please try again.`);
  }

  activeChanges = activeChanges.filter((val) => val !== msg.guild.id);
}

async function changeRoleChannel(msg, client) {
  msg.reply(`Please provide the name/ID of the new reaction roles channel or mention it.\nIf you'd like to disable the reaction roles channel, just send \`disable\`.`);

  try {
    const collected = await collectors.oneMessageFromUser(msg.channel, msg.author.id);

    if (collected.first().content === `disable`) {
      const result = await database.updateOrCreateEntry(`Guilds`, {guildID: msg.guild.id}, {rolesChannelID: null});

      if (result) {
        msg.reply(`The reaction role channel has been disabled.`);
      } else {
        msg.reply(`There was an error disabling the reaction roles channel.\nTell the bot developers if the issue persists.`);
      }
    } else {
      const newRolesChannelID = resolvers.resolveChannelID(msg.guild, collected.first().content);

      if (newRolesChannelID) {
        const result = await database.updateOrCreateEntry(`Guilds`, {guildID: msg.guild.id}, {rolesChannelID: newRolesChannelID});

        await reactManager.updateGuildEmbeds(client, msg.guild.id);

        if (result) {
          msg.reply(`Reaction roles channel has been updated!`);
        } else {
          msg.reply(`There was an error updating the reaction roles channel.\nTell the bot developers if the issue persists.`);
        }
      } else {
        msg.reply(`No channel found, please try again.`);
      }
    }
  } catch {
    msg.reply(`Command timed out, please try again.`);
  }

  activeChanges = activeChanges.filter((val) => val !== msg.guild.id);
}

async function addRoleReaction(msg, client) {
  try {
    const guildSettings = await database.getEntry(`Guilds`, {guildID: msg.guild.id});

    if (guildSettings && guildSettings.rolesChannelID) {
      msg.reply(`Please provide the name/ID of the role that you want to add or mention it.`);

      const collectedRole = await collectors.oneMessageFromUser(msg.channel, msg.author.id);
      const role = resolvers.resolveRoleID(msg.guild, collectedRole.first().content);

      if (role) {
        const emojiMsg = await msg.reply(`React to this message with the emoji that you want to use for the role.`);
        const collectedReaction = await collectors.oneReactionFromUser(emojiMsg, msg.author.id);
        const emoji = collectedReaction ? resolvers.resolveEmojiID(client, collectedReaction.first().emoji) : false;

        if (emoji) {
          msg.reply(`Please provide a category for this role reaction.`);

          const category = await collectors.oneMessageFromUser(msg.channel, msg.author.id);
          const roleCategory = await database.getEntry(`RoleCategories`, {guildID: msg.guild.id, categoryName: category.first().content});

          if (roleCategory) {
            const matchingRole = await database.getEntry(`Roles`, {roleCategory: roleCategory.ID, emojiID: emoji});

            if (matchingRole) {
              msg.reply(`A role in that category is already using that emoji, please try again.`);
            } else {
              const totalRoles = await database.getAllEntries(`Roles`, {guildID: msg.guild.id, roleCategory: roleCategory.ID});

              if (totalRoles.length > 19) {
                msg.reply(`That category has the maximum amount of roles already, please try again.`);
              } else {
                const result = await database.createEntry(`Roles`, {guildID: msg.guild.id, roleID: role, roleCategory: roleCategory.ID, emojiID: emoji});

                await reactManager.addRoleData(client, msg.guild.id, roleCategory.ID, emoji, role);

                if (result) {
                  msg.reply(`The reaction role has been added!`);
                } else {
                  msg.reply(`There was an error adding the reaction role.\nTell the bot developers if the issue persists.`);
                }
              }
            }
          } else {
            msg.reply(`Since this is a new role category, please provide a description for it.`);
            const description = await collectors.oneMessageFromUser(msg.channel, msg.author.id);

            if (description) {
              const newRoleCategory = await database.createEntry(`RoleCategories`, {guildID: msg.guild.id, categoryName: category.first().content, categoryDescription: description.first().content});

              const result = await database.createEntry(`Roles`, {guildID: msg.guild.id, roleID: role, roleCategory: newRoleCategory.ID, emojiID: emoji});

              await reactManager.addRoleData(client, msg.guild.id, newRoleCategory.ID, emoji, role, description.first().content, category.first().content);

              if (result) {
                msg.reply(`The reaction role has been added!`);
              } else {
                msg.reply(`There was an error adding the reaction role.\nTell the bot developers if the issue persists.`);
              }
            } else {
              msg.reply(`Invalid description, please try again.`);
            }
          }
        } else {
          msg.reply(`Invalid reaction, please try again.`);
        }
      } else {
        msg.reply(`Invalid role, please try again.`);
      }
    } else {
      msg.reply(`This guild has no reactions channel, please set one up with "${settings.getSettings().prefix}settings reaction-role-channel."`);
    }
  } catch {
    msg.reply(`Command timed out, please try again.`);
  }

  activeChanges = activeChanges.filter((val) => val !== msg.guild.id);
}

async function removeRoleReaction(msg, client) {
  try {
    const guildSettings = await database.getEntry(`Guilds`, {guildID: msg.guild.id});

    if (guildSettings && guildSettings.rolesChannelID) {
      const roleCategories = await database.getAllEntries(`RoleCategories`, {guildID: msg.guild.id});

      if (roleCategories && roleCategories.length > 0) {
        msg.reply(`Please provide the category of the role reaction you want to remove.`);

        const category = await collectors.oneMessageFromUser(msg.channel, msg.author.id);
        const roleCategory = await database.getEntry(`RoleCategories`, {guildID: msg.guild.id, categoryName: category.first().content});

        if (roleCategory) {
          msg.reply(`Please provide the name/ID of the role that you want to remove or mention it.`);

          const collectedRole = await collectors.oneMessageFromUser(msg.channel, msg.author.id);
          const role = resolvers.resolveRoleID(msg.guild, collectedRole.first().content);

          if (role) {
            const oldRole = await database.getEntry(`Roles`, {guildID: msg.guild.id, roleID: role, roleCategory: roleCategory.ID});
            const matchingRole = await database.removeEntry(`Roles`, {guildID: msg.guild.id, roleID: role, roleCategory: roleCategory.ID});

            if (matchingRole && oldRole) {
              const rolesLeft = await database.getAllEntries(`Roles`, {guildID: msg.guild.id, roleCategory: roleCategory.ID});

              if (!rolesLeft || rolesLeft.length < 1) {
                await reactManager.removeRoleData(client, msg.guild.id, roleCategory.ID);
                database.removeEntry(`RoleCategories`, {guildID: msg.guild.id, categoryName: category.first().content});
              } else {
                await reactManager.removeRoleData(client, msg.guild.id, roleCategory.ID, oldRole.emojiID);
              }

              msg.reply(`The role has been removed.`);
            } else {
              msg.reply(`No reaction role was found, please try again.`);
            }
          } else {
            msg.reply(`No role was found, please try again.`);
          }
        } else {
          msg.reply(`No role category was found, please try again.`);
        }
      } else {
        msg.reply(`There are no reaction roles!`);
      }
    } else {
      msg.reply(`This guild has no reactions channel, please set one up with "${settings.getSettings().prefix}settings reaction-role-channel."`);
    }
  } catch {
    msg.reply(`Command timed out, please try again.`);
  }

  activeChanges = activeChanges.filter((val) => val !== msg.guild.id);
}

async function updateRoleReactions(msg, client) {
  const guildSettings = await database.getEntry(`Guilds`, {guildID: msg.guild.id});

  if (guildSettings && guildSettings.rolesChannelID) {
    await reactManager.updateGuildEmbeds(client, msg.guild.id);

    msg.reply(`The role reactions have been updated.`);
  } else {
    msg.reply(`This guild has no role reactions channel, please set one up with "${settings.getSettings().prefix}settings reaction-role-channel."`);
  }

  activeChanges = activeChanges.filter((val) => val !== msg.guild.id);
}

async function updateCategoryName(msg, client) {
  try {
    const guildSettings = await database.getEntry(`Guilds`, {guildID: msg.guild.id});

    if (guildSettings && guildSettings.rolesChannelID) {
      msg.reply(`Please provide the current name of the category.`);
      const collectedOldName = await collectors.oneMessageFromUser(msg.channel, msg.author.id);

      msg.reply(`Please provide the new name for the category.`);
      const collectedNewName = await collectors.oneMessageFromUser(msg.channel, msg.author.id);

      const result = await database.updateEntry(`RoleCategories`, {guildID: msg.guild.id, categoryName: collectedOldName.first().content}, {categoryName: collectedNewName.first().content});
      const newResult = await database.getEntry(`RoleCategories`, {guildID: msg.guild.id, categoryName: collectedNewName.first().content});

      if (result && newResult) {
        await reactManager.updateCategoryData(client, msg.guild.id, newResult.ID, collectedNewName.first().content);
        msg.reply(`The category name was updated.`);
      } else {
        msg.reply(`Failed to update that category, please try again.`);
      }
    } else {
      msg.reply(`This guild has no role reactions channel, please set one up with "${settings.getSettings().prefix}settings reaction-role-channel."`);
    }
  } catch {
    msg.reply(`Command timed out, please try again.`);
  }

  activeChanges = activeChanges.filter((val) => val !== msg.guild.id);
}

async function updateCategoryInfo(msg, client) {
  try {
    const guildSettings = await database.getEntry(`Guilds`, {guildID: msg.guild.id});

    if (guildSettings && guildSettings.rolesChannelID) {
      msg.reply(`Please provide the name of the category.`);
      const collectedName = await collectors.oneMessageFromUser(msg.channel, msg.author.id);

      msg.reply(`Please provide the new description for the category.`);
      const collectedDescription = await collectors.oneMessageFromUser(msg.channel, msg.author.id);

      const result = await database.updateEntry(`RoleCategories`, {guildID: msg.guild.id, categoryName: collectedName.first().content}, {categoryDescription: collectedDescription.first().content});
      const newResult = await database.getEntry(`RoleCategories`, {guildID: msg.guild.id, categoryName: collectedName.first().content});

      if (result && newResult) {
        await reactManager.updateCategoryData(client, msg.guild.id, newResult.ID, null, collectedDescription.first().content);
        msg.reply(`The category description was updated.`);
      } else {
        msg.reply(`Failed to update that category, please try again.`);
      }
    } else {
      msg.reply(`This guild has no role reactions channel, please set one up with "${settings.getSettings().prefix}settings reaction-role-channel."`);
    }
  } catch {
    msg.reply(`Command timed out, please try again.`);
  }

  activeChanges = activeChanges.filter((val) => val !== msg.guild.id);
}


async function verifyReactRoles(msg, client) {
  try {
    const guildSettings = await database.getEntry(`Guilds`, {guildID: msg.guild.id});

    if (guildSettings && guildSettings.rolesChannelID) {
      const reactionCategories = await database.getAllEntries(`RoleCategories`, {guildID: msg.guild.id});
      if (reactionCategories) {
        msg.reply(`Verifying reaction roles...`);
        reactionCategories.forEach(async (category) => {
          const catRoles = await database.getAllEntries(`Roles`, {guildID: msg.guild.id, roleCategory: category.ID});
          catRoles.forEach(async (role) => {
            if (msg.guild.roles.cache.get(role.roleID)) {
              return;
            }
            await database.removeEntry(`Roles`, {ID: role.ID});
            await reactManager.removeRoleData(client, msg.guild.id, category.ID, role.emojiID);
          });

          const rolesLeft = await database.getAllEntries(`Roles`, {guildID: msg.guild.id, roleCategory: category.ID});

          if (!rolesLeft || rolesLeft.length < 1) {
            await database.removeEntry(`RoleCategories`, {ID: category.ID});
            await reactManager.removeRoleData(client, msg.guild.id, category.ID);
          }
        });
        msg.reply(`Reaction roles have been verified.  Any missing roles have been removed.`);
      } else {
        msg.reply(`This server doesn't have reaction roles set up.`);
      }
    } else {
      msg.reply(`This server doesn't have rection roles set up.`);
    }
  } catch {
    msg.reply(`There was an error verifying the reaction roles.`);
  }

  activeChanges = activeChanges.filter((val) => val !== msg.guild.id);
}

async function changeVerifiedRole(msg) {
  msg.reply(`Please provide the name/ID of the role or mention it.\nIf you'd like to disable the verified role, just send \`disable\`.`);

  try {
    const collected = await collectors.oneMessageFromUser(msg.channel, msg.author.id);

    const newRoleID = resolvers.resolveRoleID(msg.guild, collected.first().content);

    if (collected.first().content === `disable`) {
      const result = await database.updateEntry(`Guilds`, {guildID: msg.guild.id}, {verifiedRoleID: null});

      if (result) {
        msg.reply(`The verified role has been disabled.`);
      } else {
        msg.reply(`There was an error disabling the verified role.`);
      }
    } else if (newRoleID) {
      const result = await database.updateOrCreateEntry(`Guilds`, {guildID: msg.guild.id}, {verifiedRoleID: newRoleID});

      if (result) {
        msg.reply(`Verified role has been updated!`);
      } else {
        msg.reply(`There was an error updating the verified role.\nTell the bot developers if the issue persists.`);
      }
    } else {
      msg.reply(`That's an invalid role, please try again.`);
    }
  } catch {
    msg.reply(`Command timed out, please try again.`);
  }

  activeChanges = activeChanges.filter((val) => val !== msg.guild.id);
}

async function changeReportChannel(msg) {
  msg.reply(`Please provide the name/ID of the new report channel or mention it.\nIf you'd like to disable the report channel, just send \`disable\`.`);

  try {
    const collected = await collectors.oneMessageFromUser(msg.channel, msg.author.id);

    if (collected.first().content === `disable`) {
      const result = await database.updateEntry(`Guilds`, {guildID: msg.guild.id}, {reportChannelID: null});

      if (result) {
        msg.reply(`The report channel has been disabled.`);
      } else {
        msg.reply(`There was an error disabling the report channel.\nTell the bot developers if the issue persists.`);
      }
    } else {
      const newReportChannelID = resolvers.resolveChannelID(msg.guild, collected.first().content);

      if (newReportChannelID) {
        const result = await database.updateOrCreateEntry(`Guilds`, {guildID: msg.guild.id}, {reportChannelID: newReportChannelID});

        if (result) {
          msg.reply(`Report channel has been updated!`);
        } else {
          msg.reply(`There was an error updating the report channel.\nTell the bot developers if the issue persists.`);
        }
      } else {
        msg.reply(`No channel found, please try again.`);
      }
    }
  } catch {
    msg.reply(`Command timed out, please try again.`);
  }

  activeChanges = activeChanges.filter((val) => val !== msg.guild.id);
}

async function changeReportRole(msg) {
  msg.reply(`Please provide the name/ID of the role or mention it.\nIf you'd like to disable the report role, just send \`disable\`.`);

  try {
    const collected = await collectors.oneMessageFromUser(msg.channel, msg.author.id);

    const newRoleID = resolvers.resolveRoleID(msg.guild, collected.first().content);

    if (collected.first().content === `disable`) {
      const result = await database.updateEntry(`Guilds`, {guildID: msg.guild.id}, {reportRoleID: null});

      if (result) {
        msg.reply(`The report role has been disabled.`);
      } else {
        msg.reply(`There was an error disabling the report role.`);
      }
    } else if (newRoleID) {
      const result = await database.updateOrCreateEntry(`Guilds`, {guildID: msg.guild.id}, {reportRoleID: newRoleID});

      if (result) {
        msg.reply(`Report role has been updated!`);
      } else {
        msg.reply(`There was an error updating the report role.\nTell the bot developers if the issue persists.`);
      }
    } else {
      msg.reply(`That's an invalid role, please try again.`);
    }
  } catch {
    msg.reply(`Command timed out, please try again.`);
  }

  activeChanges = activeChanges.filter((val) => val !== msg.guild.id);
}
