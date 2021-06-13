// Imports
const database = require(`../helpers/database-manager`);

const Discord = require(`discord.js`);

// Vars
const options = `Currently the only options are: "welcome-message" and "welcome-channel"`;

// Exports
module.exports = {handle, getHelp};

// Help command text
const help = {
  text: `Allows a server admin to test bot settings.`,
  level: `admin`,
};

// Exported functions
function handle(client, msg) {
  if (msg.channel.type === `dm`) {
    msg.reply(`This command has to be used in a server.`);
  } else {
    const option = msg.content.split(` `);

    if (option.length > 1) {
      testSettings(msg, option[1]);
    } else {
      msg.reply(`Please provide a setting to test.\n${options}`);
    }
  }
}

function getHelp() {
  return help;
}

// Private functions
function testSettings(msg, setting) {
  switch (setting) {
    case `welcome-message`:
      testWelcomeMessage(msg);
      break;
    case `welcome-channel`:
      testWelcomeChannel(msg);
      break;
    case `logs-channel`:
      testLogsChannel(msg);
      break;
    default:
      msg.reply(`Invalid option.\n${options}`);
      break;
  }
}

async function testWelcomeMessage(msg) {
  const guildSettings = await database.getEntry(`Guilds`, {guildID: msg.guild.id});

  if (guildSettings && guildSettings.welcomeMessage) {
    const welcomeMessage = guildSettings.welcomeMessage.replace(`!!newuser!!`, `${msg.member}`);
    msg.channel.send(welcomeMessage);
  } else {
    msg.reply(`There is no welcome message set up for this guild!`);
  }
}

async function testWelcomeChannel(msg) {
  const guildSettings = await database.getEntry(`Guilds`, {guildID: msg.guild.id});

  if (guildSettings && guildSettings.welcomeMessage && guildSettings.welcomeChannelID) {
    const welcomeMessage = guildSettings.welcomeMessage.replace(`!!newuser!!`, `${msg.member}`);
    const welcomeChannel = msg.guild.channels.cache.get(guildSettings.welcomeChannelID);
    welcomeChannel.send(welcomeMessage);
  } else if (guildSettings && guildSettings.welcomeChannelID) {
    msg.reply(`There is no welcome message set up for this guild!`);
  } else {
    msg.reply(`There is no welcome channel set up for this guild!`);
  }
}

async function testLogsChannel(msg) {
  const guildSettings = await database.getEntry(`Guilds`, {guildID: msg.guild.id});

  if (guildSettings && guildSettings.logsChannelID) {
    const logsChannel = msg.guild.channels.cache.get(guildSettings.logsChannelID);
    const embed = new Discord.MessageEmbed();

    embed.setColor(`#00FF1A`);
    embed.setAuthor(msg.member.displayName, msg.author.displayAvatarURL());
    embed.setDescription(`Message was sent by ${msg.author} in ${msg.channel} to test the logs channel.`);
    embed.addField(`Message Content`, `${msg.content}`);
    embed.addField(`Message Link`, `[View Message](${msg.url})`);
    embed.setTimestamp();
    embed.setFooter(`${msg.author.tag}`);

    logsChannel.send({embeds: [embed]});
  } else {
    msg.reply(`There is no logs channel set up for this guild!`);
  }
}
