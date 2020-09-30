const database = require(`../helpers/database-manager`);
const permissions = require(`../helpers/permissions`);
const reactManager = require(`../helpers/role-react-manager-2`);
const resolvers = require(`../helpers/resolvers`);

const Discord = require(`discord.js`);

// Reactions to detect, in order: ⭐🌟
const detectedReactions = [`%E2%AD%90`, `%F0%9F%8C%9F`];

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
            await member.roles.remove(roleID);
            user.send(`You no longer have the \`${role.name}\` role.`);
          } else {
            await member.roles.add(roleID);
            user.send(`You have been given the \`${role.name}\` role.`);
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

async function detectStarboard(guildSettings, reaction, user) {
  if (!detectedReactions.includes(reaction.emoji.identifier) || !guildSettings || !guildSettings.starboardChannelID || reaction.message.channel.id === guildSettings.starboardChannelID || !reaction.message.guild.channels.cache.get(guildSettings.starboardChannelID) || !guildSettings.starboardThreshold) {
    return;
  }

  if (reaction.emoji.identifier === detectedReactions[0] && reaction.count >= guildSettings.starboardThreshold) {
    const exists = await database.getEntry(`Starboard`, {guildID: reaction.message.guild.id, channelID: reaction.message.channel.id, originalMessageID: reaction.message.id});
    checkMessage(reaction, guildSettings, exists);
  } else if (reaction.emoji.identifier === detectedReactions[1]) {
    const exists = await database.getEntry(`Starboard`, {guildID: reaction.message.guild.id, channelID: reaction.message.channel.id, originalMessageID: reaction.message.id});
    const admin = await permissions.checkAdmin(reaction.message.guild.id, user.id);

    if (exists || admin) {
      checkMessage(reaction, guildSettings, exists);
    }
  }
}

function checkMessage(reaction, guildSettings, exists) {
  if (exists) {
    updateMessage(reaction, exists, guildSettings);
  } else {
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
    if (rxn.emoji.identifier === detectedReactions[1] || rxn.emoji.identifier === detectedReactions[0]) {
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

  if (reaction.message.content) {
    embed.addField(`Message`, reaction.message.content.length > 1000 ? reaction.message.content.substr(0, 1000) : reaction.message.content);
    if (reaction.message.content.length > 1000) {
      embed.addField(`Message Continued`, reaction.message.content.substr(1000, reaction.message.content.length));
    }
  }

  embed.addField(`Message Link`, `[Jump to Message](${reaction.message.url})`);

  embed.setTimestamp(reaction.message.createdTimestamp);

  return embed;
}
