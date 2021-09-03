// Imports
const database = require(`../helpers/database-manager`);
const commandManager = require(`../helpers/command-manager`);

// Exports
module.exports = {checkAdmin, setAdminRole, removeAdminRole, checkDev, getDevs};

// Devs are hard-coded
const devs = new Set([`145730448105013248`, `151079705917915136`]);

// Exported Function
async function checkAdmin(guild, userID) {
  const guildSettings = await database.getEntry(`Guild`, {guildID: guild.id});
  const userRoles = guild.members.cache.get(userID).roles.cache;
  if (userRoles.has(guildSettings.adminRoleID) || devs.has(userID) || guild.ownerId === userID) {
    return true;
  } else {
    return false;
  }
}

async function setAdminRole(client, guild, roleID) {
  const guildSettings = await database.getEntry(`Guild`, {guildID: guild.id});

  if (guildSettings.adminRoleID === roleID) {
    return `duplicate`;
  } else {
    const result = await database.updateOrCreateEntry(`Guild`, {guildID: guild.id}, {adminRoleID: roleID});

    if (result) {
      commandManager.addRoleToGuildCommand(client, guild.id, roleID);
      return true;
    } else {
      return false;
    }
  }
}

async function removeAdminRole(client, guildID) {
  const guildSettings = await database.getEntry(`Guild`, {guildID});

  if (guildSettings && guildSettings.adminRoleID) {
    const result = await database.updateEntry(`Guild`, {guildID}, {adminRoleID: null});

    if (result) {
      commandManager.removeRoleFromGuildCommand(client, guildID, guildSettings.adminRoleID);
      return true;
    } else {
      return false;
    }
  } else {
    return `norole`;
  }
}

function checkDev(userID) {
  if (devs.has(userID)) {
    return true;
  } else {
    return false;
  }
}

function getDevs() {
  return devs;
}
