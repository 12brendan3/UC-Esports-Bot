// Imports
const database = require(`../helpers/database-manager`);
const commandManager = require(`../helpers/command-manager`);

// Exports
module.exports = {checkAdmin, addAdmin, removeAdmin, getAdmins, checkDev, getDevs};

// Devs are hard-coded
const devs = new Set([`145730448105013248`, `151079705917915136`]);

// Exported Function
async function checkAdmin(guild, userID) {
  const adminCheck = await database.getEntry(`ServerAdmins`, {guildID: guild.id, userID});
  if (adminCheck || devs.has(userID) || guild.ownerId === userID) {
    return true;
  } else {
    return false;
  }
}

async function addAdmin(client, guild, userID) {
  const adminCheck = await database.getEntry(`ServerAdmins`, {guildID: guild.id, userID});

  if (adminCheck || guild.ownerId === userID || devs.has(userID)) {
    return `duplicate`;
  } else {
    const result = await database.createEntry(`ServerAdmins`, {guildID: guild.id, userID});

    if (result) {
      commandManager.addUserToGuildCommand(client, guild.id, userID);
      return true;
    } else {
      return false;
    }
  }
}

async function removeAdmin(client, guildID, userID) {
  const adminCheck = await database.getEntry(`ServerAdmins`, {guildID, userID});

  if (adminCheck) {
    const result = await database.removeEntry(`ServerAdmins`, {guildID, userID});

    if (result) {
      commandManager.removeUserFromGuildCommand(client, guildID, userID);
      return true;
    } else {
      return false;
    }
  } else {
    return `notadmin`;
  }
}

async function getAdmins(guild) {
  const admins = await database.getAllEntries(`ServerAdmins`, {guildID: guild.id});

  admins.push({userID: guild.ownerId});

  devs.forEach((dev) => {
    if (dev !== guild.ownerId) {
      admins.push({userID: dev});
    }
  });

  if (admins && admins.length < 1) {
    return `noadmins`;
  } else if (admins) {
    return admins;
  } else {
    return false;
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
