const Discord = require(`discord.js`);

const permissions = require(`../helpers/permissions`);

// Exports
module.exports = {handle, getHelp};

// Help command text
const help = {
  text: `Allows a server admin to get information about a role in the server.`,
  level: `admin`,
  options: [
    {
      name: `role`,
      type: `ROLE`,
      description: `The role to get information on.`,
      required: true,
    },
  ],
};

// Exported functions
async function handle(client, interaction) {
  if (interaction.channel.type === `dm`) {
    interaction.reply({content: `This command has to be used in a server.`, ephemeral: true});
    return;
  }

  try {
    const isAdmin = await permissions.checkAdmin(interaction.guild, interaction.user.id);
    if (isAdmin) {
      const role = interaction.options.get(`role`).role;
      const embed = new Discord.MessageEmbed();

      embed.setColor(role.color);
      embed.setAuthor(`${role.name} Role Information`, interaction.guild.iconURL());
      embed.setTimestamp(role.createdTimestamp);
      embed.setFooter(`Role Created`);

      embed.addField(`__Total Members__`, `${role.members.size} member${role.members.size > 1 ? `s` : ``}  (${(role.members.size / interaction.guild.memberCount * 100).toFixed(2)}% of all server members)`);
      embed.addField(`__Color (hex)__`, `\`${role.hexColor}\``);
      embed.addField(`__Mentionable__`, role.mentionable ? `Yes` : `No`);
      embed.addField(`__Externally Managed__`, role.managed ? `Yes` : `No`);

      interaction.reply({embeds: [embed]});
    } else {
      interaction.reply({content: `You're not an admin on this server.`, ephemeral: true});
    }
  } catch {
    interaction.reply({content: `Command timed out, please try again.`, ephemeral: true});
  }
}

function getHelp() {
  return help;
}
