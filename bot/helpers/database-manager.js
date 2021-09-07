const Sequelize = require(`sequelize`);

const sequelize = new Sequelize(`database`, `user`, `password`, {
  host: `localhost`,
  dialect: `sqlite`,
  logging: false,
  storage: `./storage/database.sqlite`,
});

const Bearcats = sequelize.define(`Bearcats`, {
  userID: {
    type: Sequelize.STRING,
    unique: true,
    allowNull: false,
    primaryKey: true,
  },
  email: {
    type: Sequelize.STRING,
    unique: true,
    allowNull: true,
  },
  firstName: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  lastName: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  MNumber: {
    type: Sequelize.STRING,
    allowNull: true,
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
    type: Sequelize.INTEGER,
    allowNull: false,
  },
});

const Starboard = sequelize.define(`Starboard`, {
  ID: {
    type: Sequelize.UUIDV4,
    defaultValue: Sequelize.UUIDV4,
    unique: true,
    primaryKey: true,
  },
  guildID: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  channelID: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  originalMessageID: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  starboardMessageID: {
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
    type: Sequelize.TEXT,
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
  starboardThreshold: {
    type: Sequelize.INTEGER,
    allowNull: true,
  },
  twitterChannelID: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  verifiedRoleID: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  reportChannelID: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  reportRoleID: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  timeoutRoleID: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  adminRoleID: {
    type: Sequelize.STRING,
    allowNull: true,
  },
});

const ServerAdmins = sequelize.define(`ServerAdmins`, {
  ID: {
    type: Sequelize.UUIDV4,
    defaultValue: Sequelize.UUIDV4,
    unique: true,
    primaryKey: true,
  },
  guildID: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  userID: {
    type: Sequelize.STRING,
    allowNull: false,
  },
});

const Feedback = sequelize.define(`Feedback`, {
  ID: {
    type: Sequelize.UUIDV4,
    defaultValue: Sequelize.UUIDV4,
    unique: true,
    primaryKey: true,
    allowNull: false,
  },
  userID: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  messageURL: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  message: {
    type: Sequelize.TEXT,
    allowNull: false,
  },
  time: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
});

const Roles = sequelize.define(`Roles`, {
  ID: {
    type: Sequelize.UUIDV4,
    defaultValue: Sequelize.UUIDV4,
    unique: true,
    primaryKey: true,
    allowNull: false,
  },
  guildID: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  roleID: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  roleCategory: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  emojiID: {
    type: Sequelize.STRING,
    allowNull: false,
  },
});

const RoleCategories = sequelize.define(`RoleCategories`, {
  ID: {
    type: Sequelize.UUIDV4,
    defaultValue: Sequelize.UUIDV4,
    unique: true,
    primaryKey: true,
    allowNull: false,
  },
  guildID: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  messageID: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  categoryName: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  categoryDescription: {
    type: Sequelize.STRING,
    allowNull: false,
  },
});

const Tasks = sequelize.define(`Tasks`, {
  ID: {
    type: Sequelize.UUIDV4,
    defaultValue: Sequelize.UUIDV4,
    unique: true,
    primaryKey: true,
    allowNull: false,
  },
  guildID: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  channelID: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  cronString: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  taskMessage: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  taskFile: {
    type: Sequelize.STRING,
    allowNull: true,
  },
});

const Timeouts = sequelize.define(`Timeouts`, {
  ID: {
    type: Sequelize.UUIDV4,
    defaultValue: Sequelize.UUIDV4,
    unique: true,
    primaryKey: true,
    allowNull: false,
  },
  guildID: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  userID: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  expireTime: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
});

const Giveaways = sequelize.define(`Giveaways`, {
  ID: {
    type: Sequelize.UUIDV4,
    defaultValue: Sequelize.UUIDV4,
    unique: true,
    primaryKey: true,
    allowNull: false,
  },
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
  userID: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  expireTime: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  numWinners: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  title: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  description: {
    type: Sequelize.STRING,
    allowNull: true,
  },
});

// Make object containing tables
const tables = {Bearcats, XP, Starboard, Guilds, ServerAdmins, Feedback, Roles, RoleCategories, Tasks, Timeouts, Giveaways};

// Exports
module.exports = {syncTables, createEntry, getEntry, getOrCreateEntry, updateEntry, updateOrCreateEntry, removeEntry, getAllEntries};

// Exported Functions
async function syncTables() {
  console.info(`Syncing database tables...`);
  // Add "{alter: true}" to a sync to migrate the table to a newer version - it's usually really slow so it's not kept set by default
  await Promise.all([
    Bearcats.sync(),
    XP.sync(),
    Starboard.sync(),
    Guilds.sync(),
    ServerAdmins.sync(),
    Feedback.sync(),
    Roles.sync(),
    RoleCategories.sync(),
    Tasks.sync(),
    Timeouts.sync(),
    Giveaways.sync(),
  ]);
  console.info(`Database tables synced.`);
}

async function createEntry(table, newData) {
  try {
    const newEntry = await tables[table].create(newData);
    return newEntry;
  } catch (err) {
    console.error(err);
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
    console.error(err);
    return false;
  }
}

async function updateOrCreateEntry(table, filter, newData) {
  try {
    const existingEntry = await tables[table].update(newData, {where: filter});

    if (existingEntry[0] === 0) {
      throw Error(`No entries updated.`);
    }

    return existingEntry;
  } catch {
    const newEntry = createEntry(table, {...filter, ...newData});
    return newEntry;
  }
}

async function removeEntry(table, filter) {
  try {
    const result = await tables[table].destroy({where: filter});

    if (result === 0) {
      return false;
    }

    return true;
  } catch (err) {
    console.error(err);
    return false;
  }
}

async function getAllEntries(table, filter, limits) {
  try {
    const foundEntries = await tables[table].findAll({where: filter, ...limits});
    return foundEntries;
  } catch (err) {
    console.error(err);
    return false;
  }
}
