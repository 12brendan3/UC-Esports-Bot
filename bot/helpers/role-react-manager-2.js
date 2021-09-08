const database = require(`./database-manager`);

const roleData = {};

// Exports
module.exports = {loadRoleData, addRoleData, removeRoleData, updateGuildMessages, getRoleData, updateCategoryData};

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

  await updateGuildMessages(client, guildID, categoryID);
}

async function removeRoleData(client, guildID, categoryID, emojiID) {
  if (emojiID) {
    delete roleData[guildID][categoryID].roles[emojiID];

    if (roleData[guildID][categoryID].roles === {}) {
      delete roleData[guildID][categoryID];
    }

    roleData[guildID][categoryID].emojis = roleData[guildID][categoryID].emojis.filter((emoji) => emoji !== emojiID);
    await updateGuildMessages(client, guildID, categoryID);
  } else {
    delete roleData[guildID][categoryID];

    if (roleData[guildID] === {}) {
      delete roleData[guildID];
    }

    await updateGuildMessages(client, guildID);
  }
}

async function updateCategoryData(client, guildID, categoryID, name, description) {
  if (name) {
    roleData[guildID][categoryID].name = name;
    await updateGuildMessages(client, guildID, categoryID);
  } else if (description) {
    roleData[guildID][categoryID].description = description;
    await updateGuildMessages(client, guildID, categoryID);
  }
}

function generateMessage(client, guildID, categoryID) {
  let components = false;
  let buttons = [];
  let buttonCount = 1;

  if (roleData[guildID] && roleData[guildID][categoryID]) {
    components = [];

    for (const role in roleData[guildID][categoryID].roles) {
      if (Object.prototype.hasOwnProperty.call(roleData[guildID][categoryID].roles, role)) {
        const discordRole = client.guilds.cache.get(guildID).roles.cache.get(roleData[guildID][categoryID].roles[role]);
        if (discordRole) {
          buttons.push({
            type: `BUTTON`,
            label: discordRole.name,
            style: `PRIMARY`,
            custom_id: role,
            emoji: role,
          });
        }

        if ((buttonCount % 5) === 0) {
          components.push({
            type: `ACTION_ROW`,
            components: buttons,
          });
          buttons = [];
        }

        buttonCount++;
      }
    }
  }

  if (buttons.length > 0) {
    components.push({
      type: `ACTION_ROW`,
      components: buttons,
    });
  }

  const newMessage = {
    content: `**__${roleData[guildID][categoryID].name}__**\n${roleData[guildID][categoryID].description}`,
    components,
  };

  return newMessage;
}

async function updateGuildMessages(client, guildID, categoryID) {
  const guildSettings = await database.getEntry(`Guilds`, {guildID});

  if (!guildSettings || !guildSettings.rolesChannelID) {
    return;
  }

  if (categoryID) {
    await updateOneMessage(client, guildID, categoryID, guildSettings);
  } else {
    await updateAllMessages(client, guildID, guildSettings);
  }
}

async function updateOneMessage(client, guildID, categoryID, guildSettings) {
  const rolesChannel = client.guilds.cache.get(guildID).channels.cache.get(guildSettings.rolesChannelID);

  const newMessage = generateMessage(client, guildID, categoryID);

  if (roleData[guildID][categoryID].msgID) {
    const oldMessage = rolesChannel.messages.cache.get(roleData[guildID][categoryID].msgID);

    if (oldMessage) {
      oldMessage.edit(newMessage);

      oldMessage.reactions.removeAll();
    } else {
      await updateAllMessages(client, guildID, guildSettings);
    }
  } else {
    await updateAllMessages(client, guildID, guildSettings);
  }
  return true;
}

async function updateAllMessages(client, guildID, guildSettings) {
  const rolesChannel = client.guilds.cache.get(guildID).channels.cache.get(guildSettings.rolesChannelID);
  let messages = await rolesChannel.messages.fetch();

  await rolesChannel.bulkDelete(messages, true);

  messages = await rolesChannel.messages.fetch();

  messages.forEach((msg) => {
    msg.delete();
  });

  for (const category in roleData[guildID]) {
    if (Object.prototype.hasOwnProperty.call(roleData[guildID], category)) {
      const newMessage = generateMessage(client, guildID, category);
      const newMessagePost = await rolesChannel.send(newMessage);

      // eslint-disable-next-line require-atomic-updates
      roleData[guildID][category].msgID = newMessagePost.id;

      database.updateEntry(`RoleCategories`, {ID: category}, {messageID: newMessagePost.id});
    }
  }

  return true;
}

function getRoleData() {
  return roleData;
}
