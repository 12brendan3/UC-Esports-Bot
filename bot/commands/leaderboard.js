const Discord = require(`discord.js`);
const Sequelize = require(`sequelize`);

const database = require(`../helpers/database-manager`);

// Exports
module.exports = {handle, getHelp};

// Help command text
const help = {
  text: `Gets the leaderboard of users with the most XP.`,
  level: `user`,
};

// Exported functions
function handle(client, msg) {
  sendLeaderboard(client, msg);
}

async function sendLeaderboard(client, msg) {
  const embed = new Discord.MessageEmbed();

  embed.setColor(`#CC00FF`);
  embed.setAuthor(client.user.username, client.user.displayAvatarURL());
  embed.setTimestamp();

  const list = await getUserList(client);

  embed.addField(`Leaderboard - Top 10`, list);

  msg.channel.send(embed);
}

async function getUserList(client) {
  const top10 = await database.getAllEntries(`XP`, {}, {limit: 10, order: [[Sequelize.col(`XP`), `DESC`]]});

  let list = `\`\`\`\n`;
  const invalid = [];

  for (let i = 0; i < top10.length; i++) {
    const user = client.users.cache.get(top10[i].userID);
    if (user) {
      list += `${i + 1}.${i < 9 ? ` ` : ``} ${user ? user.tag : top10[i].userID} - XP: ${top10[i].XP}\n`;
    } else {
      invalid.push(top10[i].userID);
    }
  }

  list += `\`\`\``;

  if (invalid.length > 0) {
    await database.removeEntry(`XP`, {userID: invalid});
    list = await getUserList(client);
  }

  return list;
}

function getHelp() {
  return help;
}
