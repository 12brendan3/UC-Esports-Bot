const Sequelize = require(`sequelize`);
const readline = require(`readline`);
const fs = require('fs');

const input = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

console.info(`This will migrate the old Esports bot database from the old one to the new one.\n***This process is possibly destructive!!***\nMake sure you have a backup of the current database if it has any important data as it will be replaced.\nThe old database should be called "olddatabase.sqlite" and be in the storage folder.\nAt stated, the current database in the storage folder "database.sqlite" will be deleted and replaced so once again, this is a warning that ALL CURRENT DATA WILL BE LOST.`);

input.question(`If you understand and still wish to continue, type in "DATABASO DELETO" and press enter: `, (answer) => {
  if (answer === `DATABASO DELETO`) {
    migrate();
  } else {
    console.info(`Database migration cancelled.`);
  }
});

async function migrate() {
  console.info(`Deleting current database file....`);

  try {
    if (fs.existsSync(`./storage/database.sqlite`)) {
      fs.unlinkSync(`./storage/database.sqlite`);
    } else {
      console.info(`No current database to delete.`);
    }
  } catch (err) {
    console.error(err);
    console.error(`Failed to delete the current database.\nProcess cancelled.`);
    process.exit(69420);
  }

  console.info(`Current database file deleted.`);

  const oldDB = await loadOldDB();

  const newDB = await loadNewDB();

  if (oldDB && newDB) {
    console.info(`Migrating profiles....`);
    try {
      const oldProfiles = await oldDB.oldUsers.findAll();
      const queries = [];
      oldProfiles.forEach((profile) => {
        queries.push(newDB.Bearcats.create({userID: profile.id, firstName: profile.firstname, lastName: profile.lastname, MNumber: profile.mnumber}));
      });
      await Promise.all(queries);
    } catch (err) {
      console.error(err);
      console.error(`Profile migration failed.\nProcess cancelled.`);
      process.exit(1337);
    }
    console.info(`Profile migration done.`);

    console.info(`Migrating XP leaderboard....`);
    try {
      const oldUsers = await oldDB.oldXP.findAll();
      const queries = [];
      oldUsers.forEach((oldUser) => {
        const time = new Date(oldUser.lastxp).getTime();
        queries.push(newDB.XP.create({userID: oldUser.id, XP: oldUser.xp, lastXP: time}));
      });
      await Promise.all(queries);
    } catch (err) {
      console.error(err);
      console.error(`XP leaderboard migration failed.\nProcess cancelled.`);
      process.exit(42069);
    }
    console.info(`XP leaderboard migration done.`);

    console.info(`Database migration complete!\nExiting now....`);
    process.exit(0);
  } else {
    console.error(`One of the databases have an issue.\nProcess cancelled.`);
    process.exit(666);
  }
}

async function loadNewDB() {
  console.info(`Loading new database....`);
  try {
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

    // eslint-disable-next-line @shopify/prefer-module-scope-constants
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

    await Promise.all([Bearcats.sync(), XP.sync(), Starboard.sync(), Guilds.sync(), ServerAdmins.sync(), Feedback.sync()]);

    console.info(`New database loaded.`);

    return {Bearcats, XP, Starboard, Guilds, ServerAdmins, Feedback};
  } catch {
    console.error(`Failed to load new database.\nProcess cancelled.`);
    process.exit(420);
    return false;
  }
}

async function loadOldDB() {
  console.info(`Loading old database....`);
  try {
    const oldSequelize = new Sequelize(`database`, `user`, `password`, {
      host: `localhost`,
      dialect: `sqlite`,
      logging: false,
      storage: `./storage/olddatabase.sqlite`,
    });

    const oldUsers = oldSequelize.define('users', {
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

    const oldXP = oldSequelize.define('XP', {
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

    await Promise.all([oldUsers.sync(), oldXP.sync()]);
    console.info(`Old database loaded.`);
    return {oldUsers, oldXP};
  } catch {
    console.error(`Failed to load old database.  Is it in the storage folder and called "olddatabase.sqlite"?\nProcess cancelled.`);
    process.exit(69);
    return false;
  }
}
