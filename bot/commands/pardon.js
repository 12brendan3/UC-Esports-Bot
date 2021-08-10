const permissions = require(`../helpers/permissions`);
const timeouts = require(`../helpers/timeout-manager`);
const resolvers = require(`../helpers/resolvers`);
const database = require(`../helpers/database-manager`);

// Exports
module.exports = {handle, getHelp};

// Help command text
const help = {
  text: `Allows an admin to remove a user from timeout.`,
  level: `admin`,
  options: [
    {
      name: `user`,
      description: `The user to put in timeout.`,
      type: `USER`,
      required: true,
    },
  ],
};

// Exported functions
async function handle(client, interaction) {
  if (interaction.channel.type === `dm`) {
    interaction.reply(`This command has to be used in a server.`);
    return;
  }

  let isAdmin = false;
  try {
    isAdmin = await permissions.checkAdmin(interaction.guild, interaction.user.id);
  } catch {
    interaction.reply(`Command timed out, please try again.`);
    return;
  }

  if (!isAdmin) {
    interaction.reply(`You're not an admin on this server.`);
    return;
  }

  const guildSettings = await database.getEntry(`Guilds`, {guildID: interaction.guildId});

  if (!guildSettings || !guildSettings.timeoutRoleID) {
    interaction.reply(`There is no timeout role set up on this server.`);
    return;
  }

  const userID = resolvers.resolveUserID(interaction.guild, interaction.options.get(`user`).value);

  if (!userID) {
    interaction.reply(`Failed to find that user, please try again.`);
    return;
  }

  const member = interaction.guild.members.cache.get(userID);

  if (!member) {
    interaction.reply(`Failed to find that user, please try again.`);
    return;
  }

  const timeout = await database.getEntry(`Timeouts`, {guildID: interaction.guildId, userID});

  if (!timeout) {
    interaction.reply(`That user isn't in timeout.`);
    return;
  }

  const result = await timeouts.removeOne(timeout.ID, member, guildSettings.timeoutRoleID);

  if (!result) {
    interaction.reply(`There was an internal error, let the bot devs know if the error persists.`);
    return;
  }

  interaction.reply(`<@${userID}> has been pardoned.`);
}

function getHelp() {
  return help;
}
