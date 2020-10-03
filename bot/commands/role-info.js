const collectors = require(`../helpers/collectors`);
const resolvers = require(`../helpers/resolvers`);
const permissions = require(`../helpers/permissions`);

// Exports
module.exports = {handle, getHelp};

// Help command text
const help = {
  text: `Allows admins to get information about a role in the server.`,
  level: `admin`,
};

// Exported functions
async function handle(client, msg) {
  try {
    const isAdmin = await permissions.checkAdmin(msg.guild.id, msg.author.id);
    if (isAdmin) {
      msg.reply(`What role do you want information on?`);
      const collected = await collectors.oneMessageFromUser(msg.channel, msg.author.id);
      const roleID = resolvers.resolveRoleID(msg.guild, collected.first().content);
      if (roleID) {
        const role = msg.guild.roles.cache.get(roleID);
        msg.reply(`there are \`${role.members.size}\` members with the \`${role.name}\` role.\nThat's \`${(role.members.size / msg.guild.memberCount * 100).toFixed(2)}%\` of all users in the server.`);
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
