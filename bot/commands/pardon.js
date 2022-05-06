const timeouts = require(`../helpers/timeout-manager`);
const resolvers = require(`../helpers/resolvers`);
const database = require(`../helpers/database-manager`);
const replyHelper = require(`../helpers/interaction-helper`);

// Exports
module.exports = {handle, getHelp};

// Help command text
const help = {
  text: `Allows an admin to remove a user from timeout.`,
  level: `admin`,
  allowDM: false,
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
  if (interaction.channel.type === `DM`) {
    replyHelper.interactionReply(interaction, `This command has to be used in a server.`);
    return;
  }

  const guildSettings = await database.getEntry(`Guilds`, {guildID: interaction.guildId});

  if (!guildSettings || !guildSettings.timeoutRoleID) {
    replyHelper.interactionReply(interaction, `There is no timeout role set up on this server.`);
    return;
  }

  const userID = resolvers.resolveUserID(interaction.guild, interaction.options.get(`user`).value);

  if (!userID) {
    replyHelper.interactionReply(interaction, `Failed to find that user, please try again.`);
    return;
  }

  const member = interaction.guild.members.cache.get(userID);

  if (!member) {
    replyHelper.interactionReply(interaction, `Failed to find that user, please try again.`);
    return;
  }

  const timeout = await database.getEntry(`Timeouts`, {guildID: interaction.guildId, userID});

  if (!timeout) {
    replyHelper.interactionReply(interaction, `That user isn't in timeout.`);
    return;
  }

  const result = await timeouts.removeOne(timeout.ID, member, guildSettings.timeoutRoleID);

  if (!result) {
    replyHelper.interactionReply(interaction, `There was an internal error, let the bot devs know if the error persists.`);
    return;
  }

  replyHelper.interactionReply(interaction, `<@${userID}> has been pardoned.`);
}

function getHelp() {
  return help;
}
