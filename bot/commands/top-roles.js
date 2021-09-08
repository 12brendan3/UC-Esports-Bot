const Discord = require(`discord.js`);

// Exports
module.exports = {handle, getHelp};

// Help command text
const help = {
  text: `Allows an admin to get a list of the server roles. Ordered by most users to the least.`,
  level: `admin`,
};

// Exported functions
async function handle(client, interaction) {
  if (interaction.channel.type === `dm`) {
    interaction.reply({content: `This command has to be used in a server.`, ephemeral: true});
    return;
  }

  try {
    await interaction.deferReply();
    await interaction.guild.members.fetch();
    const embed = new Discord.MessageEmbed();

    embed.setColor(`#00EDCD`);
    embed.setAuthor(interaction.guild.name, interaction.guild.iconURL());
    embed.setTimestamp();

    const roles = interaction.guild.roles.cache.sort((role1, role2) => role2.members.size - role1.members.size);

    const lists = [];
    let listOld;
    let listNew = `\`\`\`\n`;
    let i = 1;

    roles.each((role) => {
      listNew += `${i}.${i < 10 ? ` ` : ``}${i < 100 ? ` ` : ``} ${role.name} - ${role.members.size} member${role.members.size > 1 ? `s` : ``}${role.members.size === 0 ? `s` : ``} (${(role.members.size / interaction.guild.memberCount * 100).toFixed(2)}%)\n`;

      if (listNew.length > 1020) {
        listOld += `\`\`\``;

        lists.push(listOld);

        listNew = `\`\`\`\n${i}.${i < 10 ? ` ` : ``}${i < 100 ? ` ` : ``} ${role.name} - ${role.members.size} member${role.members.size > 1 ? `s` : ``}${role.members.size === 0 ? `s` : ``} (${(role.members.size / interaction.guild.memberCount * 100).toFixed(2)}%)\n`;

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

    interaction.editReply({embeds: [embed]});
  } catch (err) {
    interaction.reply({content: `Command timed out, please try again.`, ephemeral: true});
  }
}

function getHelp() {
  return help;
}
