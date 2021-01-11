const Discord = require(`discord.js`);

const permissions = require(`../helpers/permissions`);

// Exports
module.exports = {handle, getHelp};

// Help command text
const help = {
  text: `Allows a server admin to get a list of the server roles ordered by the roles with the most users to the least.`,
  level: `admin`,
};

// Exported functions
async function handle(client, msg) {
  if (msg.channel.type === `dm`) {
    msg.reply(`That command has to be used in a server.`);
    return;
  }

  try {
    const isAdmin = await permissions.checkAdmin(msg.guild.id, msg.author.id);
    if (isAdmin || msg.author.id === msg.guild.ownerID) {
      await msg.reply(`Crunching numbers now....`);
      const embed = new Discord.MessageEmbed();

      embed.setColor(`#00EDCD`);
      embed.setAuthor(msg.guild.name, msg.guild.iconURL());
      embed.setTimestamp();

      const roles = msg.guild.roles.cache.sort((role1, role2) => role2.members.size - role1.members.size);

      const lists = [];
      let listOld;
      let listNew = `\`\`\`\n`;
      let i = 1;

      roles.each((role) => {
        listNew += `${i}.${i < 10 ? ` ` : ``}${i < 100 ? ` ` : ``} ${role.name} - ${role.members.size} member${role.members.size > 1 ? `s` : ``}${role.members.size === 0 ? `s` : ``} (${(role.members.size / msg.guild.memberCount * 100).toFixed(2)}%)\n`;

        if (listNew.length > 1020) {
          listOld += `\`\`\``;

          lists.push(listOld);

          listNew = `\`\`\`\n${i}.${i < 10 ? ` ` : ``}${i < 100 ? ` ` : ``} ${role.name} - ${role.members.size} member${role.members.size > 1 ? `s` : ``}${role.members.size === 0 ? `s` : ``} (${(role.members.size / msg.guild.memberCount * 100).toFixed(2)}%)\n`;

          listOld = listNew;
        } else {
          listOld = listNew;
        }

        i++;
      });

      listOld += `\`\`\``;

      lists.push(listOld);

      embed.addField(`Top Server Roles`, lists[0]);

      for (let x = 1; x < lists.length; x++) {
        embed.addField(`*** ***`, lists[x]);
      }

      msg.channel.send(embed);
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
