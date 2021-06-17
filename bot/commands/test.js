// Imports
const database = require(`../helpers/database-manager`);

const Discord = require(`discord.js`);

// Exports
module.exports = {handle, getHelp};

// Help command text
const help = {
  text: `Allows a server admin to test bot settings.`,
  level: `admin`,
  options: [
    {
      name: `test`,
      type: `STRING`,
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
  if (interaction.channel.type === `dm`) {
    interaction.reply({content: `This command has to be used in a server.`, ephemeral: true});
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
      interaction.reply(`Invalid option.`);
      break;
  }
}

async function testWelcomeMessage(interaction) {
  const guildSettings = await database.getEntry(`Guilds`, {guildID: interaction.guildID});

  if (guildSettings && guildSettings.welcomeMessage) {
    const welcomeMessage = guildSettings.welcomeMessage.replace(`!!newuser!!`, `${interaction.user}`);
    interaction.reply({content: welcomeMessage, ephemeral: true});
  } else {
    interaction.reply({content: `There is no welcome message set up for this guild!`, ephemeral: true});
  }
}

async function testWelcomeChannel(interaction) {
  const guildSettings = await database.getEntry(`Guilds`, {guildID: interaction.guildID});

  if (guildSettings && guildSettings.welcomeMessage && guildSettings.welcomeChannelID) {
    const welcomeMessage = guildSettings.welcomeMessage.replace(`!!newuser!!`, `${interaction.user}`);
    const welcomeChannel = interaction.guild.channels.cache.get(guildSettings.welcomeChannelID);
    welcomeChannel.send(welcomeMessage);
    interaction.reply({content: `Check the welcome channel! (${welcomeChannel})`, ephemeral: true});
  } else if (guildSettings && guildSettings.welcomeChannelID) {
    interaction.reply({content: `There is no welcome message set up for this guild!`, ephemeral: true});
  } else {
    interaction.reply({content: `There is no welcome channel set up for this guild!`, ephemeral: true});
  }
}

async function testLogsChannel(interaction) {
  const guildSettings = await database.getEntry(`Guilds`, {guildID: interaction.guildID});

  if (guildSettings && guildSettings.logsChannelID) {
    const logsChannel = interaction.guild.channels.cache.get(guildSettings.logsChannelID);
    const embed = new Discord.MessageEmbed();

    embed.setColor(`#00FF1A`);
    embed.setAuthor(interaction.user.username, interaction.user.displayAvatarURL());
    embed.setDescription(`Message was sent by ${interaction.user} in ${interaction.channel} to test the logs channel.`);
    embed.addField(`Message Content`, `Example content.`);
    embed.addField(`Message Link`, `${interaction.channel}`);
    embed.setTimestamp();
    embed.setFooter(`${interaction.user.tag}`);

    logsChannel.send({embeds: [embed]});
    interaction.reply({content: `Check the logs channel! (${logsChannel})`, ephemeral: true});
  } else {
    interaction.reply({content: `There is no logs channel set up for this guild!`, ephemeral: true});
  }
}
