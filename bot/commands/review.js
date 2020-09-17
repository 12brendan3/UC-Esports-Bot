const database = require(`../helpers/database-manager`);
const Discord = require(`discord.js`);
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
    sendFeedback(client, msg);
  }
}

async function sendFeedback(client, msg) {
  try {
    const result = await database.getAllEntries(`Feedback`);

    if (result && result.length > 0) {
      for (let i = 0; i < result.length; i++) {
        const embed = new Discord.MessageEmbed();

        let user = client.users.cache.get(result[i].userID);
        let displayURL = client.user.displayAvatarURL();

        if (user) {
          displayURL = user.displayAvatarURL();
          user = user.tag;
        } else {
          user = result[i].userID;
        }

        const link = result[i].messageURL === `Sent via DM` ? `Sent via DM` : `[Jump to Message](${result[i].messageURL})`;

        embed.setColor(`#CC00FF`);
        embed.setAuthor(user, displayURL);
        embed.setTimestamp(result[i].time);

        embed.addField(`Entry ID`, result[i].ID);
        if (result[i].message) {
          embed.addField(`Feedback`, result[i].message.length > 1000 ? result[i].message.substr(0, 1000) : result[i].message);
          if (result[i].message.length > 1000) {
            embed.addField(`Feedback Continued`, result[i].message.substr(1000, result[i].message.length));
          }
        }
        embed.addField(`Message Link`, link);

        msg.channel.send(embed);
      }
    } else {
      msg.reply(`there is no feedback.`);
    }
  } catch (err) {
    console.error(err);
    msg.reply(`there was an error?`);
  }
}

function getHelp() {
  return help;
}
