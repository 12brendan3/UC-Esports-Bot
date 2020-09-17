// Imports
const database = require(`../helpers/database-manager`);

// Exports
module.exports = {checkAdmin, addAdmin, removeAdmin, getAdmins, checkDev};

// Devs are temporarily hard-coded
const devs = [`145730448105013248`, `151079705917915136`];

// Exported Function
async function checkAdmin(guildID, userID) {
  const adminCheck = await database.getEntry(`ServerAdmins`, {guildID, userID});
  if (adminCheck) {
    return true;
  } else {
    return false;
  }
}

async function addAdmin(guildID, userID) {
  const adminCheck = await database.getEntry(`ServerAdmins`, {guildID, userID});

  if (adminCheck) {
    return 'duplicate';
  } else {
    const result = await database.createEntry(`ServerAdmins`, {guildID, userID});

    if (result) {
      return true;
    } else {
      return false;
    }
  }
}

async function removeAdmin(guildID, userID) {
  const adminCheck = await database.getEntry(`ServerAdmins`, {guildID, userID});

  if (adminCheck) {
    const result = await database.removeEntry(`ServerAdmins`, {guildID, userID});

    if (result) {
      return true;
    } else {
      return false;
    }
  } else {
    return 'notadmin';
  }
}

async function getAdmins(guildID) {
  const admins = await database.getAllEntries(`ServerAdmins`, {guildID});

  if (admins && admins.length < 1) {
    return `noadmins`;
  } else if (admins) {
    return admins;
  } else {
    return false;
  }
}

function checkDev(userID) {
  if (devs.includes(userID)) {
    return true;
  } else {
    return false;
  }
}
