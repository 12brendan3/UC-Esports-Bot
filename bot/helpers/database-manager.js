const Sequelize = require('sequelize');

const sequelize = new Sequelize('database', 'user', 'password', {
  host: 'localhost',
  dialect: 'sqlite',
  logging: false,
  storage: './storage/database.sqlite',
});

const Users = sequelize.define('users', {
  id: {
    type: Sequelize.STRING,
    unique: true,
    allowNull: false,
    primaryKey: true,
  },
  firstname: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  lastname: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  mnumber: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true,
  },
});

const Roles = sequelize.define('roles', {
  id: {
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

const XP = sequelize.define('XP', {
  id: {
    type: Sequelize.STRING,
    unique: true,
    allowNull: false,
    primaryKey: true,
  },
  xp: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  lastxp: {
    type: Sequelize.DATE,
    allowNull: false,
  },
});

const Starboard = sequelize.define('Starboard', {
  messageId: {
    type: Sequelize.STRING,
    unique: true,
    allowNull: false,
    primaryKey: true,
  },
});

module.exports = {
  Users,
  Roles,
  XP,
  Starboard,
  syncTables: () => {
    Users.sync();
    Roles.sync();
    XP.sync();
    Starboard.sync();
    console.info('Database tables synced.');
  },
};
