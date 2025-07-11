// Imports
const database = require(`../helpers/database-manager`);
const replyHelper = require(`../helpers/interaction-helper`);

const Discord = require(`discord.js`);

// Exports
module.exports = {handle, getHelp};

// Help command text
const help = {
  type: Discord.ApplicationCommandType.ChatInput,
  text: `Allows a server admin to test bot settings.`,
  level: `admin`,
  allowDM: false,
  options: [
    {
      name: `test`,
      type: Discord.ApplicationCommandOptionType.String,
      description: `What setting to test.`,
      required: true,
      choices: [
        {
          name: `Welcome Message`,
          value: `welcome-message`,
        },
        {
          name: `Welcome Channel`,
          value: `welcome-channel`,
        },
        {
          name: `Logs Channel`,
          value: `logs-channel`,
        },
      ],
    },
  ],
};

// Exported functions
function handle(client, interaction) {
  if (!interaction.channel) {
    replyHelper.interactionReply(interaction, {content: `This command has to be used in a server.`, ephemeral: true});
  } else {
    testSettings(interaction, interaction.options.get(`test`).value);
  }
}

function getHelp() {
  return help;
}

// Private functions
function testSettings(interaction, setting) {
  switch (setting) {
    case `welcome-message`:
      testWelcomeMessage(interaction);
      break;
    case `welcome-channel`:
      testWelcomeChannel(interaction);
      break;
    case `logs-channel`:
      testLogsChannel(interaction);
      break;
    default:
      replyHelper.interactionReply(interaction, `Invalid option.`);
      break;
  }
}

async function testWelcomeMessage(interaction) {
  const guildSettings = await database.getEntry(`Guilds`, {guildID: interaction.guildId});

  if (guildSettings && guildSettings.welcomeMessage) {
    const welcomeMessage = guildSettings.welcomeMessage.replace(`!!newuser!!`, `${interaction.user}`);
    replyHelper.interactionReply(interaction, {content: welcomeMessage, ephemeral: true});
  } else {
    replyHelper.interactionReply(interaction, {content: `There is no welcome message set up for this guild!`, ephemeral: true});
  }
}

async function testWelcomeChannel(interaction) {
  const guildSettings = await database.getEntry(`Guilds`, {guildID: interaction.guildId});

  if (guildSettings && guildSettings.welcomeMessage && guildSettings.welcomeChannelID) {
    const welcomeMessage = guildSettings.welcomeMessage.replace(`!!newuser!!`, `${interaction.user}`);
    const welcomeChannel = interaction.guild.channels.cache.get(guildSettings.welcomeChannelID);
    welcomeChannel.send(welcomeMessage);
    replyHelper.interactionReply(interaction, {content: `Check the welcome channel! (${welcomeChannel})`, ephemeral: true});
  } else if (guildSettings && guildSettings.welcomeChannelID) {
    replyHelper.interactionReply(interaction, {content: `There is no welcome message set up for this guild!`, ephemeral: true});
  } else {
    replyHelper.interactionReply(interaction, {content: `There is no welcome channel set up for this guild!`, ephemeral: true});
  }
}

async function testLogsChannel(interaction) {
  const guildSettings = await database.getEntry(`Guilds`, {guildID: interaction.guildId});

  if (guildSettings && guildSettings.logsChannelID) {
    const logsChannel = interaction.guild.channels.cache.get(guildSettings.logsChannelID);
    const embed = new Discord.EmbedBuilder();

    embed.setColor(`#00FF1A`);

    embed.setAuthor({name: interaction.user.username, iconURL: interaction.user.displayAvatarURL()});

    embed.setDescription(`Message was sent by ${interaction.user} in ${interaction.channel} to test the logs channel.`);
    
    embed.setFields({ name: `Message Content`, value: `Example content.` });

    embed.addFields({ name: `Message Link`, value: `${interaction.channel}` });

    embed.setTimestamp();

    embed.setFooter({text: `${interaction.user.tag}`});

    logsChannel.send({embeds: [embed]});
    
    replyHelper.interactionReply(interaction, {content: `Check the logs channel! (${logsChannel})`, ephemeral: true});
  } else {
    replyHelper.interactionReply(interaction, {content: `There is no logs channel set up for this guild!`, ephemeral: true});
  }
}
