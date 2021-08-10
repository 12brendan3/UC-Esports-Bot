// Imports
const database = require(`../helpers/database-manager`);
const resolvers = require(`../helpers/resolvers`);
const permissions = require(`../helpers/permissions`);
const reactManager = require(`../helpers/role-react-manager-2`);

// Vars
const activeChanges = new Set();

// Exports
module.exports = {handle, getHelp};

// Help command text
const help = {
  text: `Allows a server admin to change bot settings.`,
  level: `admin`,
  options: [
    {
      name: `welcome-message`,
      type: `SUB_COMMAND`,
      description: `Sets the server's welcome message.`,
      options: [
        {
          name: `message`,
          description: `The message to greet users with.  Use !!newuser!! to mention the new user.`,
          type: `STRING`,
          required: true,
        },
      ],
    },
    {
      name: `welcome-channel`,
      type: `SUB_COMMAND`,
      description: `Sets or disables the server's welcome channel.`,
      options: [
        {
          name: `channel`,
          description: `The channel to greet users in.`,
          type: `CHANNEL`,
          required: false,
        },
        {
          name: `disable`,
          description: `Whether or not to disable the welcome channel.`,
          type: `BOOLEAN`,
          required: false,
        },
      ],
    },
    {
      name: `admin-add`,
      type: `SUB_COMMAND`,
      description: `Adds an admin to admin list.`,
      options: [
        {
          name: `user`,
          description: `The user to add to the admin list.`,
          type: `USER`,
          required: true,
        },
      ],
    },
    {
      name: `admin-remove`,
      type: `SUB_COMMAND`,
      description: `Removes an admin from the admin list.`,
      options: [
        {
          name: `user`,
          description: `The user to remove from the admin list.`,
          type: `USER`,
          required: true,
        },
      ],
    },
    {
      name: `admin-list`,
      type: `SUB_COMMAND`,
      description: `Gets and sends the admin list.`,
    },
    {
      name: `logs-channel`,
      type: `SUB_COMMAND`,
      description: `Sets or disables the logs channel.`,
      options: [
        {
          name: `channel`,
          description: `The channel to send logs in.`,
          type: `CHANNEL`,
          required: false,
        },
        {
          name: `disable`,
          description: `Whether or not to disable the logs channel.`,
          type: `BOOLEAN`,
          required: false,
        },
      ],
    },
    {
      name: `starboard-channel`,
      type: `SUB_COMMAND`,
      description: `Sets or disables the starboard channel.`,
      options: [
        {
          name: `channel`,
          description: `The channel to send starred messages in.`,
          type: `CHANNEL`,
          required: false,
        },
        {
          name: `disable`,
          description: `Whether or not to disable the starboard.`,
          type: `BOOLEAN`,
          required: false,
        },
      ],
    },
    {
      name: `starboard-threshold`,
      type: `SUB_COMMAND`,
      description: `Sets the starboard channel threshold.`,
      options: [
        {
          name: `threshold`,
          description: `The number of star reactions needed to put the message on the starboard.`,
          type: `INTEGER`,
          required: true,
        },
      ],
    },
    {
      name: `streaming-role`,
      type: `SUB_COMMAND`,
      description: `Sets or disables the streaming role.`,
      options: [
        {
          name: `role`,
          description: `The role to give to users streaming.`,
          type: `ROLE`,
          required: false,
        },
        {
          name: `disable`,
          description: `Whether or not to disable the streaming role.`,
          type: `BOOLEAN`,
          required: false,
        },
      ],
    },
    {
      name: `react-channel`,
      type: `SUB_COMMAND`,
      description: `Sets or disables the reaction role channel.`,
      options: [
        {
          name: `channel`,
          description: `The channel to use for reaction roles.`,
          type: `CHANNEL`,
          required: false,
        },
        {
          name: `disable`,
          description: `Whether or not to disable the reaction role channel.`,
          type: `BOOLEAN`,
          required: false,
        },
      ],
    },
    {
      name: `react-add`,
      type: `SUB_COMMAND`,
      description: `Adds a reaction role.`,
      options: [
        {
          name: `role`,
          description: `The role to use for the reaction role.`,
          type: `ROLE`,
          required: true,
        },
        {
          name: `emoji`,
          description: `The name of the emoji to use for the reaction role. (case sensitive)`,
          type: `STRING`,
          required: true,
        },
        {
          name: `category`,
          description: `The name of the category to use for the reaction role. (case sensitive)`,
          type: `STRING`,
          required: true,
        },
        {
          name: `description`,
          description: `The description for the category when making a new one.`,
          type: `STRING`,
          required: false,
        },
      ],
    },
    {
      name: `react-remove`,
      type: `SUB_COMMAND`,
      description: `Removes a reaction role.`,
      options: [
        {
          name: `category`,
          description: `The category to remove the role from.`,
          type: `STRING`,
          required: true,
        },
        {
          name: `role`,
          description: `The role to remove from the category.`,
          type: `ROLE`,
          required: true,
        },
      ],
    },
    {
      name: `react-update`,
      type: `SUB_COMMAND`,
      description: `Forces an update on all reaction roles.  Only needed if there's an error.`,
    },
    {
      name: `react-cat-name`,
      type: `SUB_COMMAND`,
      description: `Updates the name of a reaction role category.`,
      options: [
        {
          name: `currentcategory`,
          description: `The current name of the category.`,
          type: `STRING`,
          required: true,
        },
        {
          name: `newcategory`,
          description: `The new name for the category.`,
          type: `STRING`,
          required: true,
        },
      ],
    },
    {
      name: `react-cat-info`,
      type: `SUB_COMMAND`,
      description: `Updates the description of a reaction role category.`,
      options: [
        {
          name: `category`,
          description: `The name of the category.`,
          type: `STRING`,
          required: true,
        },
        {
          name: `description`,
          description: `The new description for the category.`,
          type: `STRING`,
          required: true,
        },
      ],
    },
    {
      name: `react-verify`,
      type: `SUB_COMMAND`,
      description: `Verifies all reaction roles are valid and removes invalid ones.`,
    },
    {
      name: `verified-role`,
      type: `SUB_COMMAND`,
      description: `Sets or disables the verified user role.`,
      options: [
        {
          name: `role`,
          description: `The role to give to verified users.`,
          type: `ROLE`,
          required: false,
        },
        {
          name: `disable`,
          description: `Whether or not to disable the verified role.`,
          type: `BOOLEAN`,
          required: false,
        },
      ],
    },
    {
      name: `report-channel`,
      type: `SUB_COMMAND`,
      description: `Sets or disables the report channel.`,
      options: [
        {
          name: `channel`,
          description: `The channel to send flagged messages and tickets in.`,
          type: `CHANNEL`,
          required: false,
        },
        {
          name: `disable`,
          description: `Whether or not to disable the report channel.`,
          type: `BOOLEAN`,
          required: false,
        },
      ],
    },
    {
      name: `report-role`,
      type: `SUB_COMMAND`,
      description: `Sets or disables the report role.`,
      options: [
        {
          name: `role`,
          description: `The role to ping for flagged messages and tickets.`,
          type: `ROLE`,
          required: false,
        },
        {
          name: `disable`,
          description: `Whether or not to disable the report role.`,
          type: `BOOLEAN`,
          required: false,
        },
      ],
    },
    {
      name: `timeout-role`,
      type: `SUB_COMMAND`,
      description: `Sets or disables the timeout role.`,
      options: [
        {
          name: `role`,
          description: `The role to give to put users in timeout.`,
          type: `ROLE`,
          required: false,
        },
        {
          name: `disable`,
          description: `Whether or not to disable the timeout role.`,
          type: `BOOLEAN`,
          required: false,
        },
      ],
    },
  ],
};

// Exported functions
async function handle(client, interaction) {
  if (interaction.channel.type === `dm`) {
    interaction.reply({content: `That command has to be used in a server.`, ephemeral: true});
    return;
  }

  const admin = await permissions.checkAdmin(interaction.guild, interaction.user.id);

  if (admin && activeChanges.has(interaction.guildId)) {
    interaction.reply({content: `Only one change can be made at a time.`, ephemeral: true});
  } else if (admin) {
    activeChanges.add(interaction.guildId);
    changeSettings(interaction, client);
  } else {
    interaction.reply({content: `You're not an admin on this server.`, ephemeral: true});
  }
}

function getHelp() {
  return help;
}

// Private functions
function changeSettings(interaction, client) {
  switch (interaction.options.getSubcommand()) {
    case `welcome-message`:
      changeWelcomeMessage(interaction);
      break;
    case `welcome-channel`:
      changeWelcomeChannel(interaction);
      break;
    case `admin-add`:
      addAdmin(client, interaction);
      break;
    case `admin-remove`:
      removeAdmin(client, interaction);
      break;
    case `admin-list`:
      listAdmins(interaction, client);
      break;
    case `logs-channel`:
      changeLogsChannel(interaction);
      break;
    case `starboard-channel`:
      changeStarboardChannel(interaction);
      break;
    case `starboard-threshold`:
      changeStarboardThreshold(interaction);
      break;
    case `streaming-role`:
      changeStreamingRole(interaction);
      break;
    case `react-channel`:
      changeRoleChannel(interaction);
      break;
    case `react-add`:
      addRoleReaction(interaction, client);
      break;
    case `react-remove`:
      removeRoleReaction(interaction, client);
      break;
    case `react-update`:
      updateRoleReactions(interaction, client);
      break;
    case `react-cat-name`:
      updateCategoryName(interaction, client);
      break;
    case `react-cat-info`:
      updateCategoryInfo(interaction, client);
      break;
    case `react-verify`:
      verifyReactRoles(interaction, client);
      break;
    case `verified-role`:
      changeVerifiedRole(interaction);
      break;
    case `report-channel`:
      changeReportChannel(interaction);
      break;
    case `report-role`:
      changeReportRole(interaction);
      break;
    case `timeout-role`:
      changeTimeoutRole(interaction);
      break;
    default:
      activeChanges.delete(interaction.guildId);
      console.error(`Somehow an invalid setting was passed, check the slash command settings or add the invalid command.\nInvalid setting: ${interaction.options.getSubcommand()}`);
      interaction.reply({content: `There was an internal bot error.`, ephemeral: true});
      break;
  }
}

async function changeWelcomeMessage(interaction) {
  const result = await database.updateOrCreateEntry(`Guilds`, {guildID: interaction.guildId}, {welcomeMessage: interaction.options.get(`message`).value});

  if (result) {
    interaction.reply({content: `Join message has been updated!\nUse \`/test Welcome Message\` to test it.`, ephemeral: true});
  } else {
    interaction.reply({content: `There was an error saving the new welcome message.\nTell the bot developers if the issue persists.`, ephemeral: true});
  }

  activeChanges.delete(interaction.guildId);
}

async function changeWelcomeChannel(interaction) {
  const options = interaction.options;
  let result;

  if (options.get(`channel`).channel.type !== `text`) {
    interaction.reply({content: `That's not a valid text channel.`, ephemeral: true});
    return;
  }

  if (options.has(`disable`) && options.get(`disable`).value) {
    result = await database.updateOrCreateEntry(`Guilds`, {guildID: interaction.guildId}, {welcomeChannelID: null});
  } else if (options.has(`channel`)) {
    result = await database.updateOrCreateEntry(`Guilds`, {guildID: interaction.guildId}, {welcomeChannelID: options.get(`channel`).channel.id});
  } else {
    interaction.reply({content: `Please provide a channel or set disable to true to disable the welcome message.`, ephemeral: true});
    activeChanges.delete(interaction.guildId);
    return;
  }

  if (result) {
    interaction.reply({content: `Welcome message channel has been updated!\nUse \`/test Welcome Channel\` to test it.`, ephemeral: true});
  } else {
    interaction.reply({content: `There was an error updating the welcome message channel.\nTell the bot developers if the issue persists.`, ephemeral: true});
  }

  activeChanges.delete(interaction.guildId);
}

async function addAdmin(client, interaction) {
  if (interaction.options.get(`user`).user.bot) {
    interaction.reply({content: `A bot can't be added as an admin!`, ephemeral: true});
    activeChanges.delete(interaction.guildId);
    return;
  }

  const success = await permissions.addAdmin(client, interaction.guild, interaction.options.get(`user`).user.id);

  if (success && success === `duplicate`) {
    interaction.reply({content: `That user is already an admin!`, ephemeral: true});
  } else if (success) {
    interaction.reply({content: `Admin has been added!\nUse \`/settings admin-list\` to see the current admins.`, ephemeral: true});
  } else {
    interaction.reply({content: `There was an error adding the new admin.\nTell the bot developers if the issue persists.`, ephemeral: true});
  }

  activeChanges.delete(interaction.guildId);
}

async function removeAdmin(client, interaction) {
  const removeUserID = interaction.options.get(`user`).user.id;
  const adminCheck = await permissions.removeAdmin(client, interaction.guildId, removeUserID);
  if (adminCheck && adminCheck === `notadmin`) {
    interaction.reply({content: `That user isn't an admin!`, ephemeral: true});
  } else if (adminCheck) {
    if (interaction.user.id === removeUserID) {
      interaction.reply({content: `Admin has been removed!\n*Not sure why you removed yourself...*`, ephemeral: true});
    } else {
      interaction.reply({content: `Admin has been removed!\nUse \`/settings admin-list\` to see the current admins.`, ephemeral: true});
    }
  } else {
    interaction.reply({content: `There was an error removing the admin.\nTell the bot developers if the issue persists.`, ephemeral: true});
  }

  activeChanges.delete(interaction.guildId);
}

async function sendAdminList(interaction, client) {
  const admins = await permissions.getAdmins(interaction.guild);

  if (admins && admins === `noadmins`) {
    interaction.reply({content: `You're the only admin on this server.`, ephemeral: true});
    return false;
  } else if (admins) {
    let adminList = ``;

    for (let i = 0; i < admins.length; i++) {
      const adminUser = client.users.cache.get(admins[i].userID);
      if (adminUser) {
        adminList += `${adminUser.tag}\n`;
      } else {
        adminList += `${admins[i].userID} (Unknown User)\n`;
      }
    }

    interaction.reply({content: `Here are the admins:\n\`\`\`${adminList}\`\`\`\nNote: The server owner and developers are always admins.`, ephemeral: true});
    return true;
  } else {
    interaction.reply({content: `There was an error getting the admins.\nTell the bot developers if the issue persists.`, ephemeral: true});
    return false;
  }
}

async function listAdmins(interaction, client) {
  await sendAdminList(interaction, client);

  activeChanges.delete(interaction.guildId);
}

async function changeLogsChannel(interaction) {
  const options = interaction.options;
  let result;

  if (options.get(`channel`).channel.type !== `text`) {
    interaction.reply({content: `That's not a valid text channel.`, ephemeral: true});
    return;
  }

  if (options.has(`disable`) && options.get(`disable`).value) {
    result = await database.updateEntry(`Guilds`, {guildID: interaction.guildId}, {logsChannelID: null});
  } else if (options.has(`channel`)) {
    result = await database.updateEntry(`Guilds`, {guildID: interaction.guildId}, {logsChannelID: options.get(`channel`).channel.id});
  } else {
    interaction.reply({content: `Please provide a channel or set disable to true to disable logs.`, ephemeral: true});
    activeChanges.delete(interaction.guildId);
    return;
  }

  if (result) {
    interaction.reply({content: `Logs channel has been updated!\nUse \`/test Logs Channel\` to test it.`, ephemeral: true});
  } else {
    interaction.reply({content: `There was an error updating the logs channel.\nTell the bot developers if the issue persists.`, ephemeral: true});
  }

  activeChanges.delete(interaction.guildId);
}

async function changeStarboardChannel(interaction) {
  const options = interaction.options;
  let result;

  if (options.get(`channel`).channel.type !== `text`) {
    interaction.reply({content: `That's not a valid text channel.`, ephemeral: true});
    return;
  }

  if (options.has(`disable`) && options.get(`disable`).value) {
    result = await database.updateEntry(`Guilds`, {guildID: interaction.guildId}, {starboardChannelID: null});
  } else if (options.has(`channel`)) {
    result = await database.updateEntry(`Guilds`, {guildID: interaction.guildId}, {starboardChannelID: options.get(`channel`).channel.id});
  } else {
    interaction.reply({content: `Please provide a channel or set disable to true to disable the starboard.`, ephemeral: true});
    activeChanges.delete(interaction.guildId);
    return;
  }

  if (result) {
    interaction.reply({content: `Starboard channel has been updated!\nAn admin can use a 🌟 reaction to test it.`, ephemeral: true});
  } else {
    interaction.reply({content: `There was an error updating the starboard channel.\nTell the bot developers if the issue persists.`, ephemeral: true});
  }

  activeChanges.delete(interaction.guildId);
}

async function changeStarboardThreshold(interaction) {
  const newNum = interaction.options.get(`threshold`).value;
  if (newNum < 1 || newNum > 1000) {
    interaction.reply({content: `That's an invalid number, please try again.`, ephemeral: true});
  } else {
    const result = await database.updateOrCreateEntry(`Guilds`, {guildID: interaction.guildId}, {starboardThreshold: newNum});

    if (result) {
      interaction.reply({content: `Starboard threshold has been updated!\nMake sure you have a starboard channel set!\nUse \`/settings starboard-channel\` to change it.`, ephemeral: true});
    } else {
      interaction.reply({content: `There was an error updating the starboard channel.\nTell the bot developers if the issue persists.`, ephemeral: true});
    }
  }

  activeChanges.delete(interaction.guildId);
}

async function changeStreamingRole(interaction) {
  const options = interaction.options;
  let result;

  if (options.has(`disable`) && options.get(`disable`).value) {
    result = await database.updateEntry(`Guilds`, {guildID: interaction.guildId}, {streamingRoleID: null});
  } else if (options.has(`role`)) {
    result = await database.updateEntry(`Guilds`, {guildID: interaction.guildId}, {streamingRoleID: options.get(`role`).role.id});
  } else {
    interaction.reply({content: `Please provide a role or set disable to true to disable the streaming role.`, ephemeral: true});
    activeChanges.delete(interaction.guildId);
    return;
  }

  if (result) {
    interaction.reply({content: `Streaming role has been updated!`, ephemeral: true});
  } else {
    interaction.reply({content: `There was an error updating the streaming role.\nTell the bot developers if the issue persists.`, ephemeral: true});
  }

  activeChanges.delete(interaction.guildId);
}

async function changeRoleChannel(interaction) {
  const options = interaction.options;
  let result;

  if (options.get(`channel`).channel.type !== `text`) {
    interaction.reply({content: `That's not a valid text channel.`, ephemeral: true});
    return;
  }

  if (options.has(`disable`) && options.get(`disable`).value) {
    result = await database.updateOrCreateEntry(`Guilds`, {guildID: interaction.guildId}, {rolesChannelID: null});
  } else if (options.has(`role`)) {
    result = await database.updateOrCreateEntry(`Guilds`, {guildID: interaction.guildId}, {rolesChannelID: options.get(`channel`).channel.id});
  } else {
    interaction.reply({content: `Please provide a channel or set disable to true to disable the reaction role channel.`, ephemeral: true});
    activeChanges.delete(interaction.guildId);
    return;
  }

  if (result) {
    interaction.reply({content: `Reaction role channel has been updated!`, ephemeral: true});
  } else {
    interaction.reply({content: `There was an error updating the reaction role channel.\nTell the bot developers if the issue persists.`, ephemeral: true});
  }

  activeChanges.delete(interaction.guildId);
}

async function addRoleReaction(interaction, client) {
  try {
    const guildSettings = await database.getEntry(`Guilds`, {guildID: interaction.guildId});

    if (!guildSettings || !guildSettings.rolesChannelID) {
      interaction.reply({content: `There isn't a reaction role channel set.\nPlease set one up with \`/settings react-channel\``, ephemeral: true});
      activeChanges.delete(interaction.guildId);
      return;
    }

    const options = interaction.options;

    const emojiID = resolvers.resolveEmojiID(client, options.get(`emoji`).value);

    if (!emojiID) {
      interaction.reply({content: `No emoji found by that name.  Please try again.`, ephemeral: true});
      activeChanges.delete(interaction.guildId);
      return;
    }

    const roleCategory = await database.getEntry(`RoleCategories`, {guildID: interaction.guildId, categoryName: options.get(`category`).value});

    if (roleCategory) {
      const matchingRole = await database.getEntry(`Roles`, {roleCategory: roleCategory.ID, emojiID});

      if (matchingRole) {
        interaction.reply({content: `A role in that category is already using that emoji, please try again.`, ephemeral: true});
        activeChanges.delete(interaction.guildId);
        return;
      }

      const totalRoles = await database.getAllEntries(`Roles`, {guildID: interaction.guildId, roleCategory: roleCategory.ID});

      if (totalRoles.length > 19) {
        interaction.reply({content: `That category has the maximum amount of roles already, please try again.`, ephemeral: true});
        activeChanges.delete(interaction.guildId);
        return;
      }

      const result = await database.createEntry(`Roles`, {guildID: interaction.guildId, roleID: options.get(`role`).role.id, roleCategory: roleCategory.ID, emojiID});

      await reactManager.addRoleData(client, interaction.guildId, roleCategory.ID, emojiID, options.get(`role`).role.id);

      if (result) {
        interaction.reply({content: `The reaction role has been added!`, ephemeral: true});
      } else {
        interaction.reply({content: `There was an error adding the reaction role.\nTell the bot developers if the issue persists.`, ephemeral: true});
      }
    } else {
      if (!options.has(`description`)) {
        interaction.reply({content: `No category description was provided for the new category, try again with one.`, ephemeral: true});
        activeChanges.delete(interaction.guildId);
        return;
      }

      const newRoleCategory = await database.createEntry(`RoleCategories`, {guildID: interaction.guildId, categoryName: options.get(`category`).value, categoryDescription: options.get(`description`).value});

      const result = await database.createEntry(`Roles`, {guildID: interaction.guildId, roleID: options.get(`role`).role.id, roleCategory: newRoleCategory.ID, emojiID});

      await reactManager.addRoleData(client, interaction.guildId, newRoleCategory.ID, emojiID, options.get(`role`).role.id, options.get(`description`).value, options.get(`category`).value);

      if (result) {
        interaction.reply({content: `The reaction role has been added!`, ephemeral: true});
      } else {
        interaction.reply({content: `There was an error adding the reaction role.\nTell the bot developers if the issue persists.`, ephemeral: true});
      }
    }
  } catch {
    interaction.reply({content: `There was an internal error, please try again.`, ephemeral: true});
  }

  activeChanges.delete(interaction.guildId);
}

async function removeRoleReaction(interaction, client) {
  try {
    const guildSettings = await database.getEntry(`Guilds`, {guildID: interaction.guildId});

    if (!guildSettings || !guildSettings.rolesChannelID) {
      interaction.reply({content: `This guild has no reaction role channel, please set one up with \`/settings react-channel\`."`, ephemeral: true});
      activeChanges.delete(interaction.guildId);
      return;
    }

    const roleCategories = await database.getAllEntries(`RoleCategories`, {guildID: interaction.guildId});

    if (!roleCategories || roleCategories.length < 1) {
      interaction.reply({content: `There are no reaction roles!`, ephemeral: true});
      activeChanges.delete(interaction.guildId);
      return;
    }

    const options = interaction.options;

    const roleCategory = await database.getEntry(`RoleCategories`, {guildID: interaction.guildId, categoryName: options.get(`category`).value});

    if (!roleCategory) {
      interaction.reply({content: `No role category was found, please try again.`, ephemeral: true});
      activeChanges.delete(interaction.guildId);
      return;
    }

    const oldRole = await database.getEntry(`Roles`, {guildID: interaction.guildId, roleID: options.get(`role`).role.id, roleCategory: roleCategory.ID});
    const matchingRole = await database.removeEntry(`Roles`, {guildID: interaction.guildId, roleID: options.get(`role`).role.id, roleCategory: roleCategory.ID});

    if (matchingRole && oldRole) {
      const rolesLeft = await database.getAllEntries(`Roles`, {guildID: interaction.guildId, roleCategory: roleCategory.ID});

      if (!rolesLeft || rolesLeft.length < 1) {
        await reactManager.removeRoleData(client, interaction.guildId, roleCategory.ID);
        database.removeEntry(`RoleCategories`, {guildID: interaction.guildId, categoryName: options.get(`category`).value});
      } else {
        await reactManager.removeRoleData(client, interaction.guildId, roleCategory.ID, oldRole.emojiID);
      }

      interaction.reply({content: `The role has been removed.`, ephemeral: true});
    } else {
      interaction.reply({content: `No reaction role was found, please try again.`, ephemeral: true});
    }
  } catch {
    interaction.reply({content: `There was an internal error, please try again.`, ephemeral: true});
  }

  activeChanges.delete(interaction.guildId);
}

async function updateRoleReactions(interaction, client) {
  const guildSettings = await database.getEntry(`Guilds`, {guildID: interaction.guildId});

  if (guildSettings && guildSettings.rolesChannelID) {
    await reactManager.updateGuildEmbeds(client, interaction.guildId);

    interaction.reply({content: `The role reactions have been updated.`, ephemeral: true});
  } else {
    interaction.reply({content: `This guild has no reaction role channel, please set one up with \`/settings react-channel\`."`, ephemeral: true});
  }

  activeChanges.delete(interaction.guildId);
}

async function updateCategoryName(interaction, client) {
  try {
    const guildSettings = await database.getEntry(`Guilds`, {guildID: interaction.guildId});

    if (!guildSettings || !guildSettings.rolesChannelID) {
      interaction.reply({content: `This guild has no reaction role channel, please set one up with \`/settings react-channel\`."`, ephemeral: true});
      activeChanges.delete(interaction.guildId);
      return;
    }

    const options = interaction.options;

    const result = await database.updateEntry(`RoleCategories`, {guildID: interaction.guildId, categoryName: options.get(`currentcategory`).value}, {categoryName: options.get(`newcategory`).value});
    const newResult = await database.getEntry(`RoleCategories`, {guildID: interaction.guildId, categoryName: options.get(`newcategory`).value});

    if (result && newResult) {
      await reactManager.updateCategoryData(client, newResult.guildID, newResult.ID, newResult.categoryName);
      interaction.reply({content: `The category name was updated.`, ephemeral: true});
    } else {
      interaction.reply({content: `Failed to update that category, please try again.`, ephemeral: true});
    }
  } catch {
    interaction.reply({content: `There was an internal error, please try again.`, ephemeral: true});
  }

  activeChanges.delete(interaction.guildId);
}

async function updateCategoryInfo(interaction, client) {
  try {
    const guildSettings = await database.getEntry(`Guilds`, {guildID: interaction.guildId});

    if (!guildSettings || !guildSettings.rolesChannelID) {
      interaction.reply({content: `This guild has no reaction role channel, please set one up with \`/settings react-channel\`.`, ephemeral: true});
      activeChanges.delete(interaction.guildId);
      return;
    }

    const options = interaction.options;

    const result = await database.updateEntry(`RoleCategories`, {guildID: interaction.guildId, categoryName: options.get(`category`).value}, {categoryDescription: options.get(`description`).value});
    const newResult = await database.getEntry(`RoleCategories`, {guildID: interaction.guildId, categoryName: options.get(`category`).value});

    if (result && newResult) {
      await reactManager.updateCategoryData(client, newResult.guildID, newResult.ID, null, newResult.categoryDescription);
      interaction.reply({content: `The category description was updated.`, ephemeral: true});
    } else {
      interaction.reply({content: `Failed to update that category, please try again.`, ephemeral: true});
    }
  } catch {
    interaction.reply({content: `There was an internal error, please try again.`, ephemeral: true});
  }

  activeChanges.delete(interaction.guildId);
}


async function verifyReactRoles(interaction, client) {
  try {
    const guildSettings = await database.getEntry(`Guilds`, {guildID: interaction.guildId});

    if (!guildSettings || !guildSettings.rolesChannelID) {
      interaction.reply({content: `This server doesn't have reaction roles set up.`, ephemeral: true});
      activeChanges.delete(interaction.guildId);
      return;
    }

    const reactionCategories = await database.getAllEntries(`RoleCategories`, {guildID: interaction.guildId});
    if (!reactionCategories) {
      interaction.reply({content: `This server doesn't have reaction roles set up.`, ephemeral: true});
    }

    interaction.reply({content: `Verifying reaction roles...`, ephemeral: true});
    reactionCategories.forEach(async (category) => {
      const catRoles = await database.getAllEntries(`Roles`, {guildID: interaction.guildId, roleCategory: category.ID});
      catRoles.forEach(async (role) => {
        if (interaction.guild.roles.cache.get(role.roleID)) {
          return;
        }
        await database.removeEntry(`Roles`, {ID: role.ID});
        await reactManager.removeRoleData(client, interaction.guildId, category.ID, role.emojiID);
      });

      const rolesLeft = await database.getAllEntries(`Roles`, {guildID: interaction.guildId, roleCategory: category.ID});

      if (!rolesLeft || rolesLeft.length < 1) {
        await database.removeEntry(`RoleCategories`, {ID: category.ID});
        await reactManager.removeRoleData(client, interaction.guildId, category.ID);
      }
    });
    interaction.editReply({content: `Reaction roles have been verified.  Any missing roles have been removed.`, ephemeral: true});
  } catch {
    interaction.reply({content: `There was an internal error verifying the reaction roles.`, ephemeral: true});
  }

  activeChanges.delete(interaction.guildId);
}

async function changeVerifiedRole(interaction) {
  const options = interaction.options;
  let result;

  if (options.has(`disable`) && options.get(`disable`).value) {
    result = await database.updateEntry(`Guilds`, {guildID: interaction.guildId}, {verifiedRoleID: null});
  } else if (options.has(`role`)) {
    result = await database.updateEntry(`Guilds`, {guildID: interaction.guildId}, {verifiedRoleID: options.get(`role`).role.id});
  } else {
    interaction.reply({content: `Please provide a role or set disable to true to disable the verified role.`, ephemeral: true});
    activeChanges.delete(interaction.guildId);
    return;
  }

  if (result) {
    interaction.reply({content: `Verified role has been updated!`, ephemeral: true});
  } else {
    interaction.reply({content: `There was an error updating the verified role.\nTell the bot developers if the issue persists.`, ephemeral: true});
  }

  activeChanges.delete(interaction.guildId);
}

async function changeReportChannel(interaction) {
  const options = interaction.options;
  let result;

  if (options.get(`channel`).channel.type !== `text`) {
    interaction.reply({content: `That's not a valid text channel.`, ephemeral: true});
    return;
  }

  if (options.has(`disable`) && options.get(`disable`).value) {
    result = await database.updateEntry(`Guilds`, {guildID: interaction.guildId}, {reportChannelID: null});
  } else if (options.has(`role`)) {
    result = await database.updateEntry(`Guilds`, {guildID: interaction.guildId}, {reportChannelID: options.get(`channel`).channel.id});
  } else {
    interaction.reply({content: `Please provide a channel or set disable to true to disable the report channel.`, ephemeral: true});
    activeChanges.delete(interaction.guildId);
    return;
  }

  if (result) {
    interaction.reply({content: `Report channel has been updated!`, ephemeral: true});
  } else {
    interaction.reply({content: `There was an error updating the report channel.\nTell the bot developers if the issue persists.`, ephemeral: true});
  }

  activeChanges.delete(interaction.guildId);
}

async function changeReportRole(interaction) {
  const options = interaction.options;
  let result;

  if (options.has(`disable`) && options.get(`disable`).value) {
    result = await database.updateEntry(`Guilds`, {guildID: interaction.guildId}, {reportRoleID: null});
  } else if (options.has(`role`)) {
    result = await database.updateEntry(`Guilds`, {guildID: interaction.guildId}, {reportRoleID: options.get(`role`).role.id});
  } else {
    interaction.reply({content: `Please provide a role or set disable to true to disable the report role.`, ephemeral: true});
    activeChanges.delete(interaction.guildId);
    return;
  }

  if (result) {
    interaction.reply({content: `Report role has been updated!`, ephemeral: true});
  } else {
    interaction.reply({content: `There was an error updating the report role.\nTell the bot developers if the issue persists.`, ephemeral: true});
  }

  activeChanges.delete(interaction.guildId);
}

async function changeTimeoutRole(interaction) {
  const options = interaction.options;
  let result;

  if (options.has(`disable`) && options.get(`disable`).value) {
    result = await database.updateEntry(`Guilds`, {guildID: interaction.guildId}, {timeoutRoleID: null});
  } else if (options.has(`role`)) {
    result = await database.updateEntry(`Guilds`, {guildID: interaction.guildId}, {timeoutRoleID: options.get(`role`).role.id});
  } else {
    interaction.reply({content: `Please provide a role or set disable to true to disable the timeout role.`, ephemeral: true});
    activeChanges.delete(interaction.guildId);
    return;
  }

  if (result) {
    interaction.reply({content: `Timeout role has been updated!`, ephemeral: true});
  } else {
    interaction.reply({content: `There was an error updating the timeout role.\nTell the bot developers if the issue persists.`, ephemeral: true});
  }

  activeChanges.delete(interaction.guildId);
}
