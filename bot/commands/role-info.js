const Discord = require(`discord.js`);

const collectors = require(`../helpers/collectors`);
const resolvers = require(`../helpers/resolvers`);
const permissions = require(`../helpers/permissions`);

// Exports
module.exports = {handle, getHelp};

// Help command text
const help = {
  text: `Allows a server admin to get information about a role in the server.`,
  level: `admin`,
};

// Exported functions
async function handle(client, msg) {
  try {
    const isAdmin = await permissions.checkAdmin(msg.guild.id, msg.author.id);
    if (isAdmin) {
      msg.reply(`what role do you want information on?`);
      const collected = await collectors.oneMessageFromUser(msg.channel, msg.author.id);
      const roleID = resolvers.resolveRoleID(msg.guild, collected.first().content);
      if (roleID) {
        const role = msg.guild.roles.cache.get(roleID);

        const embed = new Discord.MessageEmbed();

        embed.setColor(role.color);
        embed.setAuthor(`${role.name} Role Information`, msg.guild.iconURL());
        embed.setTimestamp(role.createdTimestamp);
        embed.setFooter(`Role Created`);

        embed.addField(`__Total Members__`, `${role.members.size} member${role.members.size > 1 ? `s` : ``}  (${(role.members.size / msg.guild.memberCount * 100).toFixed(2)}% of all server members)`);
        embed.addField(`__Color (hex)__`, `\`${role.hexColor}\``);
        embed.addField(`__Mentionable__`, role.mentionable ? `Yes` : `No`);
        embed.addField(`__Externally Managed__`, role.managed ? `Yes` : `No`);

        msg.channel.send(embed);
      } else {
        msg.reply(`no role found, please try again.`);
      }
    } else {
      msg.reply(`you're not an admin on this server.`);
    }
  } catch (err) {
    console.log(err);
    msg.reply(`command timed out, please try again.`);
  }
}

function getHelp() {
  return help;
}
