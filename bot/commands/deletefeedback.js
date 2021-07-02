const database = require(`../helpers/database-manager`);
const collectors = require(`../helpers/collectors`);
const permissions = require(`../helpers/permissions`);

// Exports
module.exports = {handle, getHelp};

// Help command text
const help = {
  text: `Allows developers to delete feedback from the database.`,
  level: `developer`,
};

// Exported functions
function handle(client, msg) {
  const perm = permissions.checkDev(msg.author.id);

  if (perm) {
    removeFeedback(msg);
  }
}

async function removeFeedback(msg) {
  msg.reply(`What is the ID of the entry to remove?`);

  try {
    const removeID = await collectors.oneMessageFromUser(msg.channel, msg.author.id);

    const result = await database.removeEntry(`Feedback`, {ID: removeID.first().content});

    if (result) {
      msg.reply(`The feedback entry was removed.`);
    } else {
      msg.reply(`There was an error removing the feedback.`);
    }
  } catch (err) {
    console.error(err);
    msg.reply(`Command timed out.`);
  }
}

function getHelp() {
  return help;
}
