const database = require(`../helpers/database-manager`);
const permissions = require(`../helpers/permissions`);
const resolvers = require(`../helpers/resolvers`);

const Crypto = require(`crypto`);

const regexTime = new RegExp(`^([0-9]*d)?([0-9]*h)?([0-9]*m)?$`);

// Exports
module.exports = {handle, getHelp};

const help = {
  text: `Allows admins to create a event and collect registrants.`,
  level: `admin`,
  options: [
    {
      name: `eventName`,
      type: `STRING`,
      description: `Name of Event`,
      required: true,
    },
    {
      name: `endTime`,
      type: `STRING`,
      description: `Time that event should end. (Format: 1d2h3m).`,
      required: true,
    },
    {
      name: `eventDescription`,
      type: `STRING`,
      description: `Optional Event Description.`,
      required: false,
    },
  ],
};

function handle(client, interaction) {
  const perm = permissions.checkAdmin(interaction.user.id);

  if (perm) {
    createEvent(interaction);
  } else {
    interaction.reply({content: `You're not an admin.`, ephemeral: true});
  }
}

async function createEvent(client, interaction) {
  const time = parseTime(interaction.options.get(`endTime`).value);

  let code;
  Crypto.randomBytes(3, (err, buffer) => {
    if (err) {
      console.error(`There was an error generating a new token:`);
      console.error(err);
      interaction.reply({content: `Error generating event`});
      return;
    }

    code = buffer.toString(`hex`);
  });

  if (!time) {
    interaction.reply({content: `Invalid time format`, ephemeral: true});
    return;
  }

  const newEvent = await database.createEntry(`Events`, {
    endTime: time + Date.now(),
    eventName: interaction.options.get(`eventName`).value,
    eventDescription: interaction.options.get(`eventDescription`) ? interaction.options.get(`eventDescription`).value : null,
    signInCode: code,
  });

  setTimeout(async () => {
    await database.updateEntry(`Events`, {ID: newEvent.ID}, {signInCode: null});
  }, time);

}

function parseTime(timeString) {
  const regExc = regexTime.exec(timeString);

  if (!regExc) {
    return false;
  }

  let time = 0;

  time += regExc[1] ? parseInt(regExc[1].slice(0, -1), 10) * 86400000 : 0;
  time += regExc[2] ? parseInt(regExc[2].slice(0, -1), 10) * 3600000 : 0;
  time += regExc[3] ? parseInt(regExc[3].slice(0, -1), 10) * 60000 : 0;

  return time;
}

function getHelp() {
  return help;
}