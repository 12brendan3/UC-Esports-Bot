const Discord = require(`discord.js`);

const database = require(`./database-manager`);
const resolvers = require(`./resolvers`);

const roleData = {};

// Exports
module.exports = {loadRoleData, addRoleData, removeRoleData, updateGuildEmbeds, getRoleData, updateCategoryData};

async function loadRoleData() {
  const categories = await database.getAllEntries(`RoleCategories`);
  const roles = await database.getAllEntries(`Roles`);

  categories.forEach((category) => {
    if (!roleData[category.guildID]) {
      roleData[category.guildID] = {};
    }

    if (!roleData[category.guildID][category.ID]) {
      roleData[category.guildID][category.ID] = {};
    }

    roleData[category.guildID][category.ID].name = category.categoryName;
    roleData[category.guildID][category.ID].description = category.categoryDescription;

    if (category.messageID) {
      roleData[category.guildID][category.ID].msgID = category.messageID;
    }
  });

  roles.forEach((role) => {
    if (!roleData[role.guildID][role.roleCategory].roles) {
      roleData[role.guildID][role.roleCategory].roles = {};
    }

    roleData[role.guildID][role.roleCategory].roles[role.emojiID] = role.roleID;

    if (!roleData[role.guildID][role.roleCategory].emojis) {
      roleData[role.guildID][role.roleCategory].emojis = [];
    }

    roleData[role.guildID][role.roleCategory].emojis.push(role.emojiID);
  });

  return true;
}

async function addRoleData(client, guildID, categoryID, emojiID, roleID, catDesc, catName) {
  if (!roleData[guildID]) {
    roleData[guildID] = {};
  }

  if (!roleData[guildID][categoryID]) {
    roleData[guildID][categoryID] = {};
  }

  if (!roleData[guildID][categoryID].roles) {
    roleData[guildID][categoryID].roles = {};
  }

  roleData[guildID][categoryID].roles[emojiID] = roleID;

  if (!roleData[guildID][categoryID].emojis) {
    roleData[guildID][categoryID].emojis = [];
  }

  if (catName) {
    roleData[guildID][categoryID].name = catName;
  }

  if (catDesc) {
    roleData[guildID][categoryID].description = catDesc;
  }

  roleData[guildID][categoryID].emojis.push(emojiID);

  await updateGuildEmbeds(client, guildID, categoryID);
}

async function removeRoleData(client, guildID, categoryID, emojiID) {
  if (emojiID) {
    delete roleData[guildID][categoryID].roles[emojiID];

    if (roleData[guildID][categoryID].roles === {}) {
      delete roleData[guildID][categoryID];
    }

    roleData[guildID][categoryID].emojis = roleData[guildID][categoryID].emojis.filter((emoji) => emoji !== emojiID);
    await updateGuildEmbeds(client, guildID, categoryID);
  } else {
    delete roleData[guildID][categoryID];

    if (roleData[guildID] === {}) {
      delete roleData[guildID];
    }

    await updateGuildEmbeds(client, guildID);
  }
}

async function updateCategoryData(client, guildID, categoryID, name, description) {
  if (name) {
    roleData[guildID][categoryID].name = name;
    await updateGuildEmbeds(client, guildID, categoryID);
  } else if (description) {
    roleData[guildID][categoryID].description = description;
    await updateGuildEmbeds(client, guildID, categoryID);
  }
}

function generateEmbed(client, guildID, categoryID) {
  let embed = false;

  if (roleData[guildID] && roleData[guildID][categoryID]) {
    embed = new Discord.MessageEmbed();

    embed.setColor(`#FF0000`);
    embed.setAuthor(`${roleData[guildID][categoryID].name}`);
    embed.setDescription(roleData[guildID][categoryID].description);

    const fields = [];

    for (const role in roleData[guildID][categoryID].roles) {
      if (Object.prototype.hasOwnProperty.call(roleData[guildID][categoryID].roles, role)) {
        const emoji = client.emojis.cache.get(role);
        const discordRole = client.guilds.cache.get(guildID).roles.cache.get(roleData[guildID][categoryID].roles[role]);
        if (emoji && discordRole) {
          fields.push({name: `${emoji} ${discordRole.name}`, value: `*** ***`, inline: true});
        } else if (discordRole) {
          fields.push({name: `${role} ${discordRole.name}`, value: `*** ***`, inline: true});
        }
      }
    }

    embed.addFields(fields);
  }

  return embed;
}

async function updateGuildEmbeds(client, guildID, categoryID) {
  const guildSettings = await database.getEntry(`Guilds`, {guildID});

  if (!guildSettings || !guildSettings.rolesChannelID) {
    return;
  }

  if (categoryID) {
    await updateOneEmbed(client, guildID, categoryID, guildSettings);
  } else {
    await updateAllEmbeds(client, guildID, guildSettings);
  }
}

async function updateOneEmbed(client, guildID, categoryID, guildSettings) {
  const rolesChannel = client.guilds.cache.get(guildID).channels.cache.get(guildSettings.rolesChannelID);

  const newEmbed = generateEmbed(client, guildID, categoryID);

  if (roleData[guildID][categoryID].msgID) {
    const oldMessage = rolesChannel.messages.cache.get(roleData[guildID][categoryID].msgID);

    if (oldMessage) {
      oldMessage.edit(newEmbed);

      const emojis = roleData[guildID][categoryID].emojis;

      oldMessage.reactions.cache.each(async (reaction) => {
        const reactionEmoji = await resolvers.resolveEmojiID(client, reaction.emoji);
        if (!emojis.includes(reactionEmoji)) {
          reaction.remove();
        }
      });

      emojis.forEach((emoji) => {
        const hasEmoji = oldMessage.reactions.cache.get(emoji);
        if (!hasEmoji) {
          oldMessage.react(emoji);
        }
      });
    } else {
      await updateAllEmbeds(client, guildID, guildSettings);
    }
  } else {
    await updateAllEmbeds(client, guildID, guildSettings);
  }
  return true;
}

async function updateAllEmbeds(client, guildID, guildSettings) {
  const rolesChannel = client.guilds.cache.get(guildID).channels.cache.get(guildSettings.rolesChannelID);
  const messages = await rolesChannel.messages.fetch();
  rolesChannel.bulkDelete(messages);

  for (const category in roleData[guildID]) {
    if (Object.prototype.hasOwnProperty.call(roleData[guildID], category)) {
      const newEmbed = generateEmbed(client, guildID, category);
      const newMessage = await rolesChannel.send(newEmbed);

      // eslint-disable-next-line require-atomic-updates
      roleData[guildID][category].msgID = newMessage.id;

      const emojis = roleData[guildID][category].emojis;

      if (emojis) {
        emojis.forEach((emoji) => {
          newMessage.react(emoji);
        });
      }

      database.updateEntry(`RoleCategories`, {ID: category}, {messageID: newMessage.id});
    }
  }

  return true;
}

function getRoleData() {
  return roleData;
}
