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

const Roles = sequelize.define(`roles`, {
  roleID: {
    type: Sequelize.STRING,
    unique: true,
    allowNull: false,
    primaryKey: true,
  },
  name: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  emoji: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  category: {
    type: Sequelize.CHAR,
    allowNull: false,
  },
  desc: {
    type: Sequelize.STRING,
    allowNull: false,
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
  key: {
    type: Sequelize.INTEGER,
    unique: true,
    allowNull: false,
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
  messageID: {
    type: Sequelize.STRING,
    allowNull: false,
  },
});

const Guild = sequelize.define(`Guild`, {
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

module.exports = {
  Users,
  Roles,
  XP,
  Starboard,
  Guild,
  syncTables: () => {
    Users.sync();
    Roles.sync();
    XP.sync();
    Starboard.sync();
    Guild.sync();
    console.info(`Database tables synced.`);
  },
};
