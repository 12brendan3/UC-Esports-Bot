// Regex
const regexRoleMention = RegExp(`^<@&[0-9]*>$`);
const regexChannelMention = RegExp(`^<#[0-9]*>$`);
const regexUserMention = RegExp(`^<@!?[0-9]*>$`);
const regexUserTag = RegExp(`^.{1,}#[0-9]{4}$`);
const regexObjectID = RegExp(`^[0-9]*$`);

// Exports
module.exports = {resolveChannelID, resolveUserID, resolveRoleID};

// Exported Functions
function resolveChannelID(guild, channelObject) {
  let channelID = channelObject;

  if (regexChannelMention.test(channelObject)) {
    channelID = channelObject.substr(2).slice(0, -1);
  } else if (regexObjectID.test(channelObject)) {
    const foundChannel = guild.channels.cache.get(channelObject);

    if (!foundChannel) {
      channelID = false;
    }
  } else {
    const foundChannel = guild.channels.cache.find((channel) => channel.name === channelObject);

    if (foundChannel) {
      channelID = foundChannel.id;
    } else {
      channelID = false;
    }
  }

  return channelID;
}

function resolveUserID(guild, userObject) {
  let userID = userObject;
  if (regexUserMention.test(userObject)) {
    if (userObject.startsWith(`<@!`)) {
      userID = userObject.substr(3).slice(0, -1);
    } else {
      userID = userObject.substr(2).slice(0, -1);
    }
  } else if (regexUserTag.test(userObject)) {
    const foundMember = guild.members.cache.find((member) => member.user.tag === userObject);
    if (foundMember) {
      userID = foundMember.id;
    } else {
      userID = false;
    }
  } else if (regexObjectID.test(userObject)) {
    const foundMember = guild.members.cache.get(userObject);

    if (!foundMember) {
      userID = false;
    }
  } else {
    const foundMember = guild.members.cache.find((member) => member.displayName === userObject);

    if (foundMember) {
      userID = foundMember.id;
    } else {
      userID = false;
    }
  }

  return userID;
}

function resolveRoleID(guild, roleObject) {
  let roleID = roleObject;
  if (regexRoleMention.test(roleObject)) {
    roleID = roleObject.substr(3).slice(0, -1);
  } else if (regexObjectID.test(roleObject)) {
    const foundRole = guild.roles.cache.get(roleObject);

    if (!foundRole) {
      roleID = false;
    }
  } else {
    const foundRole = guild.roles.cache.find((role) => role.displayName === roleObject);

    if (foundRole) {
      roleID = foundRole.id;
    } else {
      roleID = false;
    }
  }

  return roleID;
}
