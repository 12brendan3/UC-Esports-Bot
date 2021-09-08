const Discord = require(`discord.js`);
const Sequelize = require(`sequelize`);
const database = require(`./database-manager`);

// Exports
module.exports = {addOne, endOne, registerExisting};

const activeGiveaways = new Map();
const regexTime = new RegExp(`^([0-9]*d)?([0-9]*h)?([0-9]*m)?([0-9]*s)?$`);

// Functions
async function addOne(client, interaction) {
  const title = interaction.options.get(`name`).value;

  const description = interaction.options.get(`description`) ? interaction.options.get(`description`).value : null;

  const duration = parseTime(interaction.options.get(`duration`).value);

  const numWinners = interaction.options.get(`winners`) ? interaction.options.get(`winners`).value : 1;

  const endTime = Date.now() + duration;

  const embed = generateGiveawayEmbed(title, description, endTime, interaction.member, numWinners);

  await interaction.reply({embeds:[embed]});
  const reply = await interaction.fetchReply();

  let result;
  try {
    result = await database.createEntry(`Giveaways`, {guildID: reply.guild.id, channelID: reply.channel.id, messageID: reply.id, userID: interaction.member.id, expireTime: endTime, numWinners, title, description});
  } catch {
    interaction.deleteReply();
    interaction.followUp({content: `There was an internal error, please try again.\nLet the bot devs know if the issue persists.`, ephemeral: true});
    return;
  }

  if (!result) {
    interaction.deleteReply();
    interaction.followUp({content: `There was an internal error, please try again.\nLet the bot devs know if the issue persists.`, ephemeral: true});
    return;
  }

  const reaction = await reply.react(`🎉`);

  registerGiveaway(client, reply, interaction.member, reaction, result);
}

async function endOne(client, interaction) {
  const title = interaction.options.get(`name`).value;

  const roll = interaction.options.get(`roll`) ? true : false;

  let result;
  try {
    result = await database.getEntry(`Giveaways`, {guildID: interaction.guild.id, channelID: interaction.channel.id, title, expireTime: {[Sequelize.Op.ne]: 0}});
  } catch {
    interaction.reply({content: `There was an internal error, please try again.\nLet the bot devs know if the issue persists.`, ephemeral: true});
    return;
  }

  if (!result) {
    interaction.reply({content: `There was no giveaway found by that name. (Are you using this command in the same channel as the giveaway and typing the exact name?)`, ephemeral: true});
    return;
  }

  const giveaway = activeGiveaways.get(result.ID);

  giveaway.callback(roll);
  clearTimeout(giveaway.timeout);

  activeGiveaways.delete(result.ID);

  await interaction.reply({content: `The giveaway has been ended.`, ephemeral: true});
}

function registerGiveaway(client, reply, member, reaction, entry) {
  const duration = entry.expireTime - Date.now();
  const callback = (async (roll) => {
    const endEmbed = generateGiveawayEmbed(entry.title, entry.description, entry.expireTime, member, entry.numWinners, true);
    await reply.edit({embeds:[endEmbed]});
    await reaction.users.remove(client.user.id);
    await database.updateEntry(`Giveaways`, {ID: entry.ID}, {expireTime: 0});
    if (roll) {
      rollWinners(reply, reaction, entry, member);
    }
  });

  const timeout = setTimeout(() => {
    callback(true);
  }, duration);

  activeGiveaways.set(entry.ID, {timeout, callback});
}

function rollWinners(reply, reaction, entry, member) {
  const winners = reaction.users.cache.random(entry.numWinners);

  let winnerString = ``;

  winners.forEach(winner => {
    winnerString += `${winner}\n`;
  });

  const embed = generateWinnersEmbed(winnerString, entry, member);

  reply.reply({embeds: [embed]});
}

function generateWinnersEmbed(winnerString, entry, member) {
  const embed = new Discord.MessageEmbed();

  embed.setTitle(entry.title);
  embed.setDescription(`${entry.description ? entry.description + `\n\n` : ``}Winners:\n${winnerString === `` ? `No one entered the giveaway!` : winnerString}`);
  embed.setColor(`#FF00E6`);
  embed.setFooter(`Started by ${member.displayName}`, member.user.displayAvatarURL());
  embed.setAuthor(`Giveaway Winners`, member.guild.iconURL);

  return embed;
}

function generateGiveawayEmbed(title, description, endTime, member, numWinners, winners) {
  const embed = new Discord.MessageEmbed();

  embed.setTitle(title);
  if (winners) {
    embed.setAuthor(`Giveaway Ended`, member.guild.iconURL);
    embed.setDescription(`${description ? description + `\n\n` : ``}This giveaway has ended.`);
  } else {
    embed.setAuthor(`New Giveaway`, member.guild.iconURL);
    embed.setDescription(`${description ? description + `\n\n` : ``}This giveaway ends <t:${Math.floor(endTime / 1000)}:R>.\n${numWinners} winners.\nReact with 🎉 to enter!`);
  }
  embed.setColor(`#FF00E6`);
  embed.setFooter(`Started by ${member.displayName}`, member.user.displayAvatarURL());

  return embed;
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
  time += regExc[4] ? parseInt(regExc[4].slice(0, -1), 10) * 1000 : 0;

  return time;
}

async function registerExisting(client) {
  console.info(`Registering existing giveaways...`);
  const giveaways = await database.getAllEntries(`Giveaways`, {expireTime: {[Sequelize.Op.ne]: 0}});
  giveaways.forEach(async (entry) => {
    const guild = client.guilds.cache.get(entry.guildID);
    const member = guild.members.cache.get(entry.userID);
    const channel = guild.channels.cache.get(entry.channelID);
    const reply = await channel.messages.fetch(entry.messageID);
    const reaction = reply.reactions.resolve(`🎉`);
    registerGiveaway(client, reply, member, reaction, entry);
  });
  console.info(`Existing giveaways registered.`);
}
