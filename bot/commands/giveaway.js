// Imports

const Discord = require(`discord.js`);

const permissions = require(`../helpers/permissions`);
const resolvers = require(`../helpers/resolvers`);
const collectors = require(`../helpers/collectors`);

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
  const perm = permissions.checkAdmin(msg.guild, msg.author.id);
  if (perm) {

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
    const giveawayMessage = await info.giveawayChannel.send({embeds: [embed]});

    giveawayMessage.react(`🎁`);

    // Filter only for gift reactions
    // Time is given in hours, multiply to milliseconds.
    const filter = (reaction, user) => (reaction.emoji.name === `🎁` && !user.bot);
    const giveaway = await giveawayMessage.createReactionCollector(filter, {time: info.hours * 3600000});

    // When the giveaway is over, send a message in the giveaway channel with the winner.
    giveaway.on(`end`, (collected) => {
      let isBot = true;
      let winner;

      while (isBot) {
        winner = collected.get(`🎁`).users.cache.random();
        if (!winner.bot) {
          isBot = false;
        }
      }

      embed.setDescription(`This giveaway has ended.`);

      giveawayMessage.edit(embed);

      info.giveawayChannel.send(`The winner is ${winner}.  Please DM ${msg.author} for your prize if they don't reach out shortly.`);
    });

  } else {
    msg.channel.send(`You do not have permission`);
  }

  async function getGiveawayInfo() {
    // Series of ask for data, collect from user, and pick out the content

    // Get giveaway title
    msg.channel.send(`Please give the name of the item for the giveaway`);
    const giveawayNameCollected = await collectors.oneMessageFromUser(msg.channel, msg.author.id);
    const giveawayName = giveawayNameCollected.first().content;

    // Get giveaway expiration in hours
    msg.channel.send(`Please give a numerical value for how long you want the giveaway to last in hours`);
    const hoursCollected = await collectors.oneMessageFromUser(msg.channel, msg.author.id);
    const hours = hoursCollected.first().content;

    // Get giveaway channel
    msg.channel.send(`Please give the channel where you want to hold the giveaway`);
    const channelCollected = await collectors.oneMessageFromUser(msg.channel, msg.author.id);
    const giveawayChannel = msg.guild.channels.cache.get(resolvers.resolveChannelID(msg.guild, channelCollected.first().content));

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

    // If hours > 12, we know it`s a PM time. else, it`s AM. if hours is 0, that means 12 AM.
    if (hours >= 12) {
      isPm = true;
      embedHour %= 12;
    } else if (hours === 0) {
      embedHour = 12;
    }

    // Embed styling
    embed.setColor(`#FF0000`);
    embed.setAuthor(`${giveawayName} Giveaway!`);
    embed.setDescription(`This giveaway will expire at ${embedHour}:${exp.getMinutes()} ${isPm ? `PM` : `AM`}.`);

    return embed;
  }
}

function getHelp() {
  return help;
}
