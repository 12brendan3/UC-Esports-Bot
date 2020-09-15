const Sequelize = require(`sequelize`);

const sequelize = new Sequelize(`database`, `user`, `password`, {
  host: `localhost`,
  dialect: `sqlite`,
  logging: false,
  storage: `./storage/database.sqlite`,
});

const Users = sequelize.define(`users`, {
  userID: {
    type: Sequelize.STRING,
    unique: true,
    allowNull: false,
    primaryKey: true,
  },
  firstName: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  lastName: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  MNumber: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true,
  },
});

const XP = sequelize.define(`XP`, {
  userID: {
    type: Sequelize.STRING,
    unique: true,
    allowNull: false,
    primaryKey: true,
  },
  XP: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  lastXP: {
    type: Sequelize.DATE,
    allowNull: false,
  },
});

const Starboard = sequelize.define(`Starboard`, {
  guildID: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  channelID: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  messageID: {
    type: Sequelize.STRING,
    allowNull: false,
  },
});

const Guilds = sequelize.define(`Guilds`, {
  guildID: {
    type: Sequelize.STRING,
    unique: true,
    allowNull: false,
    primaryKey: true,
  },
  botPrefix: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  welcomeMessage: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  welcomeChannelID: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  logsChannelID: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  streamingRoleID: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  rolesChannelID: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  starboardChannelID: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  twitterChannelID: {
    type: Sequelize.STRING,
    allowNull: true,
  },
});

// Make object containing tables
const tables = {Users, XP, Starboard, Guilds};

// Exports
module.exports = {syncTables, createEntry, getEntry, getOrCreateEntry, updateEntry, updateOrCreateEntry, removeEntry};

// Exported Functions
function syncTables() {
  Users.sync();
  XP.sync();
  Starboard.sync();
  Guilds.sync();
  console.info(`Database tables synced.`);
}

async function createEntry(table, newData) {
  try {
    const newEntry = await tables[table].create(newData);
    return newEntry;
  } catch (err) {
    return false;
  }
}

async function getEntry(table, filter) {
  try {
    const existingEntry = await tables[table].findOne({where: filter});
    return existingEntry;
  } catch (err) {
    return false;
  }
}

async function getOrCreateEntry(table, filter) {
  try {
    const existingEntry = await tables[table].findOne({where: filter});
    return existingEntry;
  } catch {
    const newEntry = await createEntry(table, filter);
    return newEntry;
  }
}

async function updateEntry(table, filter, newData) {
  try {
    const existingEntry = await tables[table].update(newData, {where: filter});
    return existingEntry;
  } catch (err) {
    return false;
  }
}

async function updateOrCreateEntry(table, filter, newData) {
  try {
    const existingEntry = await tables[table].update(newData, {where: filter});

    if (existingEntry[0] === 0) {
      console.log(existingEntry);
      throw Error('No entries updated.');
    }

    return existingEntry;
  } catch (err) {
    console.error(err);
    const newEntry = createEntry(table, {...filter, ...newData});
    return newEntry;
  }
}

async function removeEntry(table, filter) {
  try {
    await tables[table].destroy({where: filter});
    return true;
  } catch (err) {
    return false;
  }
}
