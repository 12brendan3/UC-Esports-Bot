const database = require(`../helpers/database-manager`);
const collectors = require(`../helpers/collectors`);
const permissions = require(`../helpers/permissions`);

// Exports
module.exports = {handle, getHelp};

// Help command text
const help =
null;

// Exported functions
function handle(client, msg) {
  const perm = permissions.checkDev(msg.author.id);

  if (perm) {
    removeFeedback(msg);
  }
}

async function removeFeedback(msg) {
  msg.reply('What is the ID of the entry to remove?');

  try {
    const removeID = await collectors.oneMessageFromUser(msg.channel, msg.author.id);

    const result = await database.removeEntry(`Feedback`, {ID: removeID.first().content});

    if (result) {
      msg.reply(`the feedback entry was removed.`);
    } else {
      msg.reply(`there was an error removing the feedback.`);
    }
  } catch (err) {
    console.error(err);
    msg.reply(`command timed out.`);
  }
}

function getHelp() {
  return help;
}
