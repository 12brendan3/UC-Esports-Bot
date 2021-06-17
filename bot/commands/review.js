const Discord = require(`discord.js`);

const database = require(`../helpers/database-manager`);
const permissions = require(`../helpers/permissions`);

// Exports
module.exports = {handle, getHelp};

// Help command text
const help = {
  text: `Allows developers to review bot feedback.`,
  level: `developer`,
};

// Exported functions
function handle(client, interaction) {
  const perm = permissions.checkDev(interaction.user.id);

  if (perm) {
    sendFeedback(client, interaction);
  }
}

async function sendFeedback(client, interaction) {
  try {
    const result = await database.getAllEntries(`Feedback`);

    if (result && result.length < 1) {
      interaction.reply(`There is no feedback.`);
      return;
    }

    const embeds = [];

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

      let link = result[i].messageURL;
      if (result[i].messageURL.startsWith(`https://`)) {
        link = `[View Message](${result[i].messageURL})`;
      } else if (result[i].messageURL !== `Sent via DM`) {
        link = `<#${result[i].messageURL}>`;
      }

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

      embeds.push(embed);
    }

    interaction.reply({embeds});
  } catch (err) {
    console.error(err);
    interaction.reply(`There was an error.`);
  }
}

function getHelp() {
  return help;
}
