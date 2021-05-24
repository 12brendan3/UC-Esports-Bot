const database = require(`../helpers/database-manager`);
const permissions = require(`../helpers/permissions`);
const reactManager = require(`../helpers/role-react-manager-2`);
const resolvers = require(`../helpers/resolvers`);

const Discord = require(`discord.js`);

// Starboard reactions to detect in order: ⭐🌟
const detectedStarboardReactions = [`%E2%AD%90`, `%F0%9F%8C%9F`];

// Regex
const regexImage = RegExp(`^.+(\\.(jpe?g|png|gif|bmp))$`);

// Exports
module.exports = {handle};

// Exported function
async function handle(client, reaction, user) {
  if (user.bot || reaction.message.channel.type === `dm`) {
    return;
  }

  const guildSettings = await database.getEntry(`Guilds`, {guildID: reaction.message.guild.id});

  if (!guildSettings) {
    return;
  }

  detectStarboard(guildSettings, reaction, user);

  detectRoleReaction(client, guildSettings, reaction, user);

  detectFlagReaction(guildSettings, reaction, user);
}

async function detectRoleReaction(client, guildSettings, reaction, user) {
  if (!guildSettings.rolesChannelID) {
    return;
  }

  const roleData = reactManager.getRoleData();

  if (!roleData[reaction.message.guild.id]) {
    return;
  }

  for (const category in roleData[reaction.message.guild.id]) {
    if (Object.prototype.hasOwnProperty.call(roleData[reaction.message.guild.id], category) && roleData[reaction.message.guild.id][category].msgID === reaction.message.id) {
      const emoji = resolvers.resolveEmojiID(client, reaction.emoji);
      const roleID = roleData[reaction.message.guild.id][category].roles[emoji];

      if (roleID) {
        const member = reaction.message.guild.members.cache.get(user.id);
        const role = reaction.message.guild.roles.cache.get(roleID);

        try {
          if (member.roles.cache.get(roleID)) {
            await member.roles.remove(roleID, `User requested role removal.`);
            user.send(`You no longer have the \`${role.name}\` role in \`${reaction.message.guild.name}\`.`);
          } else {
            await member.roles.add(roleID, `User requested role addition.`);
            user.send(`You have been given the \`${role.name}\` role in \`${reaction.message.guild.name}\`.`);
          }
        } catch {
          const message = await reaction.message.channel.send(`${user}, there was an error giving you the \`${role.name}\` role.\nTell an admin if they don't notice.  There may be a permission issue.`);
          setTimeout(() => message.delete(), 5000);
        }

        reaction.users.remove(user.id);
        break;
      }
    }
  }
}

function detectFlagReaction(guildSettings, reaction, user) {
  // Detects 🚩
  if (reaction.emoji.identifier !== `%F0%9F%9A%A9` || reaction.count > 1) {
    return;
  }

  if (!guildSettings || !guildSettings.reportChannelID || (!guildSettings.starboardChannelID && reaction.message.channel.id === guildSettings.starboardChannelID) || (!guildSettings.rolesChannelID && reaction.message.channel.id === guildSettings.rolesChannelID)) {
    return;
  }

  reaction.remove();

  const newEmbed = generateReportEmbed(reaction.message, user);

  const repChannel = reaction.message.guild.channels.cache.get(guildSettings.reportChannelID);

  if (guildSettings.reportRoleID) {
    repChannel.send(`<@&${guildSettings.reportRoleID}>`, newEmbed);
  } else {
    repChannel.send(newEmbed);
  }

  user.send(`Message has been flagged for review by admins.`);
}

function generateReportEmbed(msg, user) {
  const embed = new Discord.MessageEmbed();

  embed.setDescription(`A message has been flagged.`);
  embed.setColor(`#FF0000`);
  embed.setAuthor(msg.author.tag, msg.author.displayAvatarURL());
  embed.addField(`Message`, msg.content);
  embed.addField(`Message Link`, `[View Message](${msg.url})`);
  embed.setFooter(user.tag, user.displayAvatarURL());
  embed.setTimestamp();

  return embed;
}

async function detectStarboard(guildSettings, reaction, user) {
  if (!detectedStarboardReactions.includes(reaction.emoji.identifier) || !guildSettings || !guildSettings.starboardChannelID || reaction.message.channel.id === guildSettings.starboardChannelID || !reaction.message.guild.channels.cache.get(guildSettings.starboardChannelID) || !guildSettings.starboardThreshold) {
    return;
  }

  if (reaction.emoji.identifier === detectedStarboardReactions[0]) {
    const exists = await database.getEntry(`Starboard`, {guildID: reaction.message.guild.id, channelID: reaction.message.channel.id, originalMessageID: reaction.message.id});
    checkMessage(reaction, guildSettings, exists, false);
  } else if (reaction.emoji.identifier === detectedStarboardReactions[1]) {
    const exists = await database.getEntry(`Starboard`, {guildID: reaction.message.guild.id, channelID: reaction.message.channel.id, originalMessageID: reaction.message.id});
    const admin = await permissions.checkAdmin(reaction.message.guild.id, user.id);

    if (exists || admin || reaction.message.guild.ownerID === user.id) {
      checkMessage(reaction, guildSettings, exists, true);
    }
  }
}

function checkMessage(reaction, guildSettings, exists, bypass) {
  if (exists) {
    updateMessage(reaction, exists, guildSettings);
  } else if (reaction.count >= guildSettings.starboardThreshold || bypass) {
    starMessage(reaction, guildSettings);
  }
}


async function starMessage(reaction, guildSettings) {
  const embed = buildEmbed(reaction);

  const starboardChannel = reaction.message.guild.channels.cache.get(guildSettings.starboardChannelID);
  const starboardMessage = await starboardChannel.send(embed);

  database.createEntry(`Starboard`, {guildID: reaction.message.guild.id, channelID: reaction.message.channel.id, originalMessageID: reaction.message.id, starboardMessageID: starboardMessage.id});
}

async function updateMessage(reaction, entry, guildSettings) {
  const embed = buildEmbed(reaction);

  const starboardChannel = reaction.message.guild.channels.cache.get(guildSettings.starboardChannelID);
  try {
    const starboardMessage = await starboardChannel.messages.fetch(entry.starboardMessageID);

    starboardMessage.edit(embed);
  } catch {
    const starboardMessage = await starboardChannel.send(embed);
    database.updateEntry(`Starboard`, {guildID: reaction.message.guild.id, channelID: reaction.message.channel.id, originalMessageID: reaction.message.id}, {starboardMessageID: starboardMessage.id});
  }
}

function buildEmbed(reaction) {
  const embed = new Discord.MessageEmbed();

  let description = ``;
  reaction.message.reactions.cache.each((rxn) => {
    if (rxn.emoji.identifier === detectedStarboardReactions[1] || rxn.emoji.identifier === detectedStarboardReactions[0]) {
      description += `    ${rxn.emoji} ${rxn.count}`;
    }
  });

  embed.setColor(`#FFEE00`);
  if (reaction.message.member) {
    embed.setAuthor(reaction.message.member.displayName, reaction.message.author.displayAvatarURL());
  } else {
    embed.setAuthor(reaction.message.author.username, reaction.message.author.displayAvatarURL());
  }
  embed.setDescription(description);

  if (reaction.message.attachments) {
    const images = [];
    reaction.message.attachments.each((attachment) => {
      if (attachment.size < 8000000 && regexImage.test(attachment.name)) {
        images.push(attachment.url);
      }
    });
    embed.setImage(images[0]);
  }

  embed.addField(`Message`, reaction.message.content);

  embed.addField(`Message Link`, `[View Message](${reaction.message.url})`);

  embed.setTimestamp(reaction.message.createdTimestamp);

  return embed;
}
