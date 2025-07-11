const Discord = require(`discord.js`);
const Sequelize = require(`sequelize`);

const database = require(`../helpers/database-manager`);
const replyHelper = require(`../helpers/interaction-helper`);

// Exports
module.exports = {handle, getHelp};

// Help command text
const help = {
  type: Discord.ApplicationCommandType.ChatInput,
  text: `Sends the leaderboard of the top 20 users with the most XP.`,
  level: `user`,
  allowDM: true,
};

// Exported functions
function handle(client, interaction) {
  sendLeaderboard(client, interaction);
}

async function sendLeaderboard(client, interaction) {
  const embed = new Discord.EmbedBuilder();

  embed.setColor(`#CC00FF`);
  embed.setAuthor({name: client.user.username, iconURL: client.user.displayAvatarURL()});
  embed.setTimestamp();

  const list = await getUserList(client);

  embed.setFields({ name: `Leaderboard - Top 20`, value: list });

  replyHelper.interactionReply(interaction, {embeds: [embed]});
}

async function getUserList(client) {
  const top20 = await database.getAllEntries(`XP`, {}, {limit: 20, order: [[Sequelize.col(`XP`), `DESC`]]});

  let list = `\`\`\`\n`;
  // const invalid = [];

  for (let i = 0; i < top20.length; i++) {
    const user = client.users.cache.get(top20[i].userID);
    if (user) {
      list += `${i + 1}.${i < 9 ? ` ` : ``} ${user.tag} - XP: ${top20[i].XP}\n`;
    } else {
      list += `${i + 1}.${i < 9 ? ` ` : ``} ${top20[i].userID} (Unknown) - XP: ${top20[i].XP}\n`;
      // invalid.push(top20[i].userID);
    }
  }

  list += `\`\`\``;

  /* if (invalid.length > 0) {
    await database.removeEntry(`XP`, {userID: invalid});
    list = await getUserList(client);
  }*/

  return list;
}

function getHelp() {
  return help;
}
