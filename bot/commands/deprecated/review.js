const Discord = require(`discord.js`);

const database = require(`../../helpers/database-manager`);
const replyHelper = require(`../../helpers/interaction-helper`);

// Exports
module.exports = {handle, getHelp};

// Help command text
const help = {
  text: `Allows developers to review bot feedback.`,
  level: `developer`,
};

// Exported functions
function handle(client, interaction) {
  sendFeedback(client, interaction);
}

async function sendFeedback(client, interaction) {
  try {
    const result = await database.getAllEntries(`Feedback`);

    if (result && result.length < 1) {
      replyHelper.interactionReply(interaction, `There is no feedback.`);
      return;
    }

    const embeds = [];

    for (let i = 0; i < result.length; i++) {
      const embed = new Discord.EmbedBuilder();

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

      embed.setAuthor({name: user, iconURL: displayURL});

      embed.setTimestamp(result[i].time);

      embed.setFields({ name: `Entry ID`, value: result[i].ID });
      if (result[i].message) {
        embed.addFields({ name: `Feedback`, value: result[i].message.length > 1000 ? result[i].message.substr(0, 1000) : result[i].message });
        if (result[i].message.length > 1000) {
          embed.addFields({ name: `Feedback Continued`, value: result[i].message.substr(1000, result[i].message.length) });
        }
      }

      embed.addFields({ name: `Message Link`, value: link });

      embeds.push(embed);
    }

    replyHelper.interactionReply(interaction, {embeds});
  } catch (err) {
    console.error(err);
    replyHelper.interactionReply(interaction, `There was an error.`);
  }
}

function getHelp() {
  return help;
}
