const collectors = require(`../helpers/collectors`);
const database = require(`../helpers/database-manager`);

// Exports
module.exports = {handle, getHelp};

// Help command text
const help = {
  text: `Allows anyone to provide feedback directly to the bot developers.  Use this command for improvements, bugs, etc.`,
  level: `user`,
};

// Exported functions
async function handle(client, msg) {
  msg.reply(`thanks for helping improve the bot, send your feedback now (the next message you send will be your message to us).`);

  try {
    const collected = await collectors.oneMessageFromUser(msg.channel, msg.author.id);

    if (collected.first().content) {
      const message = collected.first();
      const messageURL = message.channel.type === `dm` ? `Sent via DM` : message.url;

      const result = await database.createEntry(`Feedback`, {userID: message.author.id, messageURL, message: message.content, time: message.createdTimestamp});

      if (result) {
        msg.reply(`your feedback has been recorded!`);
      } else {
        msg.reply(`there was an error saving your feedback.  Tell the bot developers directly if the issue persists.`);
      }
    } else {
      msg.reply(`no feedback was provided in your message.`);
    }
  } catch {
    msg.reply(`command timed out, please try again.`);
  }
}

function getHelp() {
  return help;
}
