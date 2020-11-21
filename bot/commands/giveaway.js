// Imports

const Discord = require('discord.js');

const permissions = require('../helpers/permissions');
const {resolveChannelID} = require('../helpers/resolvers');

// Exports
module.exports = {handle, getHelp};

// Help command text
const help = {
  text: `Runs a giveaway`,
  level: `admin`,
};

// Exported Functions
async function handle(client, msg) {

  // Check if user is allowed to use this command.
  const perm = permissions.checkAdmin(msg.author.id);
  if (perm || msg.author.id === msg.guild.ownerID) {

    // Get giveaway info
    /* {
      giveawayName,
      hours,
      giveawayChannel
    } */
    const info = await getGiveawayInfo();

    // Build embed with the info
    const embed = createEmbedListener(info.giveawayName, info.hours);

    // send embed message
    const giveawayMessage = await info.giveawayChannel.send(embed);

    // Filter only for gift reactions
    // Time is given in hours, multiply to milliseconds.
    const filter = (reaction, user) => (reaction.emoji.name === '🎁' && !user.bot);
    const giveaway = await giveawayMessage.createReactionCollector(filter, {time: info.hours * 3600000});

    giveawayMessage.react('🎁');

    // When the giveaway is over, send a message in the giveaway channel with the winner.
    giveaway.on('end', (collected) => {
      // get a random winner. this is bugged, you need to get the winner id from the selected winner object.
      const winner = collected.random();

      info.giveawayChannel.send(`The winner is ${winner}. Please DM <@!${msg.author.id}> for your prize`);
    });

  } else {
    msg.channel.send('You do not have permission');
  }

  async function getGiveawayInfo() {
    // Filter used for all 3 messageAwaits
    const filter = (message, user) => user.id === msg.author.id;

    // Series of ask for data, collect from user, and pick out the content

    // Get giveaway title
    msg.channel.send('Please give the name of the item for the giveaway');
    const giveawayNameCollected = await msg.channel.awaitMessages(filter, {max: 1, time: 60000, errors: ['time']});
    const giveawayName = giveawayNameCollected.first().content;

    // Get giveaway expiration in hours
    msg.channel.send('Please give a numerical value for how long you want the giveaway to last');
    const hoursCollected = await msg.channel.awaitMessages(filter, {max: 1, time: 60000, errors: ['time']});
    const hours = hoursCollected.first().content;

    // Get giveaway channel
    msg.channel.send('Please give the channel where you want to hold the giveaway');
    const channelCollected = await msg.channel.awaitMessages(filter, {max: 1, time: 60000, errors: ['time']});
    const giveawayChannel = resolveChannelID(msg.channel.guild, channelCollected.first().content);

    return {giveawayName, hours, giveawayChannel};
  }

  function createEmbedListener(giveawayName, hours) {
    const embed = new Discord.MessageEmbed();

    // Create a Date that is now + hours ahead
    const now = new Date();
    const exp = new Date(now.getTime() + (hours * 3600000));

    // used for saying AM vs PM
    let isPm = false;
    let embedHour = exp.getHours();

    // If hours > 12, we know it's a PM time. else, it's AM. if hours is 0, that means 12 AM.
    if (hours > 12) {
      isPm = true;
      embedHour %= 12;
    } else if (hours === 0) {
      embedHour = 12;
    }

    // Embed styling
    embed.setColor(`#FF0000`);
    embed.setAuthor(`${giveawayName} Giveaway!`);
    embed.setAuthor(`This giveaway will expire: ${embedHour}:${exp.getMinutes()} ${isPm ? 'PM' : 'AM'} `);

    return embed;

  }
}

function getHelp() {
  return help;
}
