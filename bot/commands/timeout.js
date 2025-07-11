const Discord = require(`discord.js`);

const timeouts = require(`../helpers/timeout-manager`);
const resolvers = require(`../helpers/resolvers`);
const database = require(`../helpers/database-manager`);
const replyHelper = require(`../helpers/interaction-helper`);

const regexTime = new RegExp(`^([0-9]*d)?([0-9]*h)?([0-9]*m)?$`);

// Exports
module.exports = {handle, getHelp};

// Help command text
const help = {
  type: Discord.ApplicationCommandType.ChatInput,
  text: `Allows an admin to put a user in timeout.`,
  level: `admin`,
  allowDM: false,
  options: [
    {
      name: `user`,
      description: `The user to put in timeout.`,
      type: Discord.ApplicationCommandOptionType.User,
      required: true,
    },
    {
      name: `time`,
      description: `The duration to put the user in timeout. (Format: 1d2h3m)`,
      type: Discord.ApplicationCommandOptionType.String,
      required: true,
    },
  ],
};

// Exported functions
async function handle(client, interaction) {
  if (!interaction.channel) {
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

  const timeout = await database.getEntry(`Timeouts`, {guildID: interaction.guildId, userID});

  if (timeout) {
    replyHelper.interactionReply(interaction, `That user is already in timeout.`);
    return;
  }

  const time = parseTime(interaction.options.get(`time`).value);

  if (!time) {
    replyHelper.interactionReply(interaction, `Failed to parse the timeout duration or the timeout is too long (max ~25 days), please try again.`);
    return;
  }

  const result = await timeouts.createOne(time, userID, interaction.guild, guildSettings.timeoutRoleID);

  if (result) {
    replyHelper.interactionReply(interaction, result);
    return;
  }

  replyHelper.interactionReply(interaction, `<@${userID}> has been put in timeout for ${convertTime(time)}.`);
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

  return time;
}

function convertTime(ms) {
  let mins = Math.floor(ms / 60000);
  let hours = Math.floor(mins / 60);
  mins %= 60;
  const days = Math.floor(hours / 24);
  hours %= 24;

  return `${days}d${hours}h${mins}m`;
}

function getHelp() {
  return help;
}
