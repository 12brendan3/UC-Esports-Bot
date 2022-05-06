const database = require(`../helpers/database-manager`);
const reactManager = require(`../helpers/role-react-manager-2`);
const resolvers = require(`../helpers/resolvers`);

const Discord = require(`discord.js`);

// Starboard reactions to detect in order: ⭐🌟
const detectedStarboardReactions = [`%E2%AD%90`, `%F0%9F%8C%9F`];

// Regex
const regexImage = new RegExp(`^.+(\\.(jpe?g|png|gif|bmp))$`);

// Exports
module.exports = {handle};

// Exported function
async function handle(client, reaction, user) {
  if (user.bot || reaction.message.channel.type === `DM`) {
    return;
  }

  const guildSettings = await database.getEntry(`Guilds`, {guildID: reaction.message.guildId});

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

  if (!roleData[reaction.message.guildId]) {
    return;
  }

  for (const category in roleData[reaction.message.guildId]) {
    if (Object.prototype.hasOwnProperty.call(roleData[reaction.message.guildId], category) && roleData[reaction.message.guildId][category].msgID === reaction.message.id) {
      const emoji = resolvers.resolveEmojiID(client, reaction.emoji);
      const roleID = roleData[reaction.message.guildId][category].roles[emoji];

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
    repChannel.send({embeds: [newEmbed]});
  }

  user.send(`Message has been flagged for review by admins.`);
}

function generateReportEmbed(msg, user) {
  const embed = new Discord.MessageEmbed();

  embed.setDescription(`A message has been flagged.`);
  embed.setColor(`#FF0000`);
  embed.setAuthor({name: msg.author.tag, iconURL: msg.author.displayAvatarURL()});
  if (msg.content) {
    embed.addField(`Message`, msg.content.length > 1000 ? msg.content.substr(0, 1000) : msg.content);
    if (msg.content.length > 1000) {
      embed.addField(`*** ***`, msg.content.substr(1000, msg.content.length));
    }
  }
  embed.addField(`Message Link`, `[View Message](${msg.url})`);
  embed.setFooter({text: user.tag, iconURL: user.displayAvatarURL()});
  embed.setTimestamp();

  return embed;
}

async function detectStarboard(guildSettings, reaction, user) {
  if (!detectedStarboardReactions.includes(reaction.emoji.identifier) || !guildSettings || !guildSettings.starboardChannelID || reaction.message.channel.id === guildSettings.starboardChannelID || !reaction.message.guild.channels.cache.get(guildSettings.starboardChannelID) || !guildSettings.starboardThreshold) {
    return;
  }

  if (reaction.emoji.identifier === detectedStarboardReactions[0]) {
    const exists = await database.getEntry(`Starboard`, {guildID: reaction.message.guildId, channelID: reaction.message.channel.id, originalMessageID: reaction.message.id});
    checkMessage(reaction, guildSettings, exists, false);
  } else if (reaction.emoji.identifier === detectedStarboardReactions[1]) {
    const exists = await database.getEntry(`Starboard`, {guildID: reaction.message.guildId, channelID: reaction.message.channel.id, originalMessageID: reaction.message.id});
    const owner = reaction.message.guild.ownerId === user.id;

    if (exists || owner) {
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
  const starboardMessage = await starboardChannel.send({embeds: [embed]});

  database.createEntry(`Starboard`, {guildID: reaction.message.guildId, channelID: reaction.message.channel.id, originalMessageID: reaction.message.id, starboardMessageID: starboardMessage.id});
}

async function updateMessage(reaction, entry, guildSettings) {
  const embed = buildEmbed(reaction);

  const starboardChannel = reaction.message.guild.channels.cache.get(guildSettings.starboardChannelID);
  try {
    const starboardMessage = await starboardChannel.messages.fetch(entry.starboardMessageID);

    starboardMessage.edit({embeds: [embed]});
  } catch {
    const starboardMessage = await starboardChannel.send({embeds: [embed]});
    database.updateEntry(`Starboard`, {guildID: reaction.message.guildId, channelID: reaction.message.channel.id, originalMessageID: reaction.message.id}, {starboardMessageID: starboardMessage.id});
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
    embed.setAuthor({name: reaction.message.member.displayName, iconURL: reaction.message.author.displayAvatarURL()});
  } else {
    embed.setAuthor({name: reaction.message.author.username, iconURL: reaction.message.author.displayAvatarURL()});
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

  if (reaction.message.content) {
    embed.addField(`Message`, reaction.message.content.length > 1000 ? reaction.message.content.substr(0, 1000) : reaction.message.content);
    if (reaction.message.content.length > 1000) {
      embed.addField(`*** ***`, reaction.message.content.substr(1000, reaction.message.content.length));
    }
  }

  embed.addField(`Message Link`, `[View Message](${reaction.message.url})`);

  embed.setTimestamp(reaction.message.createdTimestamp);

  return embed;
}
