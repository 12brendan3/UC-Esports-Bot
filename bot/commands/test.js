// Imports
const database = require('../helpers/database-manager');

// Vars
const options = `Currently the only options are: "welcome-message" and "welcome-channel"`;

// Exports
module.exports = {handle, getHelp};

// Help command text
const help =
`Allows a server admin to test bot settings.`;

// Exported functions
function handle(client, msg) {
  if (msg.channel.type === `dm`) {
    msg.reply(`This command has to be used in a server.`);
  } else {
    const option = msg.content.split(' ');

    if (option.length > 1) {
      testSettings(msg, option[1]);
    } else {
      msg.reply(`please provide a setting to test.\n${options}`);
    }
  }
}

function getHelp() {
  return help;
}

// Private functions
function testSettings(msg, setting) {
  switch (setting) {
    case 'welcome-message':
      testWelcomeMessage(msg);
      break;
    case 'welcome-channel':
      testWelcomeChannel(msg);
      break;
    default:
      msg.reply(`Invalid option.\n${options}`);
      break;
  }
}

async function testWelcomeMessage(msg) {
  const guildSettings = await database.getEntry(`Guilds`, {guildID: msg.guild.id});

  if (guildSettings) {
    const welcomeMessage = guildSettings.welcomeMessage.replace(`!!newuser!!`, `${msg.member}`);
    msg.channel.send(welcomeMessage);
  } else {
    msg.reply(`there is no welcome message set up for this guild!`);
  }
}

async function testWelcomeChannel(msg) {
  const guildSettings = await database.getEntry(`Guilds`, {guildID: msg.guild.id});

  if (guildSettings.welcomeMessage && guildSettings.welcomeChannelID) {
    const welcomeMessage = guildSettings.welcomeMessage.replace(`!!newuser!!`, `${msg.member}`);
    const welcomeChannel = msg.guild.channels.cache.get(guildSettings.welcomeChannelID);
    welcomeChannel.send(welcomeMessage);
  } else if (guildSettings.welcomeChannelID) {
    msg.reply(`there is no welcome message set up for this guild!`);
  } else {
    msg.reply(`there is no welcome channel set up for this guild!`);
  }
}
