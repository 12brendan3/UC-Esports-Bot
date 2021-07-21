const database = require(`./database-manager`);

// Exports
module.exports = {createOne, removeOne, clearAll, registerExisting};

const timeouts = new Map();

function setOne(ID, time, member, roleID) {
  const newTimeout = setTimeout(() => {
    removeOne(ID, member, roleID);
  }, time);
  timeouts.set(ID, newTimeout);
}

async function createOne(time, userID, guild, roleID) {
  const member = guild.members.cache.get(userID);

  if (!member) {
    return `There was an error finding that user, please try again.`;
  }

  let result = false;
  try {
    result = await database.createEntry(`Timeouts`, {userID, guildID: guild.id, expireTime: Date.now() + time});
  } catch (err) {
    console.error(err);
    return `There was an internal error, let the bot devs know if the issue persists.`;
  }

  if (!result) {
    return `Failed to create a new entry, please try again.`;
  }

  member.roles.add(roleID);

  setOne(result.ID, time, member, roleID);

  return false;
}

async function removeOne(ID, member, roleID) {
  const timeout = timeouts.get(ID);
  if (timeout) {
    clearTimeout(timeout);
  }

  timeouts.delete(ID);

  let result = false;
  try {
    result = await database.removeEntry(`Timeouts`, {ID});
  } catch (err) {
    console.error(err);
    return false;
  }

  member.roles.remove(roleID);
  return result;
}

function clearAll() {
  timeouts.forEach((timeout, key) => {
    clearTimeout(timeout);
    timeouts.delete(key);
  });
}

async function registerExisting(client) {
  console.info(`Registering existing timeouts...`);
  const timeoutEntries = await database.getAllEntries(`Timeouts`);

  for (let i = 0; i < timeoutEntries.length; i++) {
    const timeout = timeoutEntries[i];
    const guildSettings = await database.getEntry(`Guilds`, {guildID: timeout.guildID});
    const guild = client.guilds.cache.get(timeout.guildID);
    const member = guild.members.cache.get(timeout.userID);

    if (Date.now() > timeout.expireTime) {
      member.roles.remove(guildSettings.timeoutRoleID);

    } else {
      setOne(timeout.ID, timeout.expireTime - Date.now(), member, guildSettings.timeoutRoleID);
    }
  }

  console.info(`Existing timeouts registered.`);
}
