const database = require(`../helpers/database-manager`);
const collectors = require(`../helpers/collectors`);
const resolvers = require(`../helpers/resolvers`);
const permissions = require(`../helpers/permissions`);

// Exports
module.exports = {handle, getHelp};

// Help command text
const help = {
  text: `Allows developers to transfer XP from one user to another.`,
  level: `developer`,
};

// Exported functions
function handle(client, msg) {
  const perm = permissions.checkDev(msg.author.id);

  if (perm || msg.author.id === msg.guild.ownerID) {
    transferXP(msg);
  }
}

function getHelp() {
  return help;
}

// Private Functions
async function transferXP(msg) {
  msg.reply(`What is the name of the user to transfer the XP *from*?`);

  const user1 = await collectors.oneMessageFromUser(msg.channel, msg.author.id);
  const parsedUser1 = resolvers.resolveUserID(msg.guild, user1.first().content);
  if (!parsedUser1) {
    msg.reply(`invalid user, process canceled, please try again.`);
    return;
  }

  try {
    const result = await database.getEntry(`XP`, {userID: parsedUser1});

    if (result && result.XP) {
      let newXP = result.XP;
      msg.reply(`What is the name of the user to transfer the XP *to*?`);
      const user2 = await collectors.oneMessageFromUser(msg.channel, msg.author.id);
      const parsedUser2 = resolvers.resolveUserID(msg.guild, user2.first().content);
      if (!parsedUser2) {
        msg.reply(`Invalid user, process canceled, please try again.`);
        return;
      }

      if (parsedUser1 === parsedUser2) {
        msg.reply(`Those are the same user, process canceled, please try again.`);
        return;
      }

      const result2 = await database.getEntry(`XP`, {userID: parsedUser2});

      if (result2 && result2.XP) {
        newXP += result2.XP;
      }

      msg.reply(`This will transfer all XP from <@!${parsedUser1}> to <@!${parsedUser2}>.\nPlease type "confirm" to confirm.`);

      const confirmation = await collectors.oneMessageFromUser(msg.channel, msg.author.id);

      if (confirmation.first().content === `confirm`) {
        await database.updateOrCreateEntry(`XP`, {userID: parsedUser2}, {XP: newXP});
        await database.updateOrCreateEntry(`XP`, {userID: parsedUser1}, {XP: 0});

        msg.reply(`XP has been transferred!`);
      } else {
        msg.reply(`Confirmation failed, process canceled.`);
      }
    } else {
      msg.reply(`That user has no XP!`);
    }
  } catch (err) {
    console.error(err);
    msg.reply(`process canceled, command timed out.`);
  }
}
