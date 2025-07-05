const Discord = require(`discord.js`);
const replyHelper = require(`../helpers/interaction-helper`);

// Exports
module.exports = {handle, getHelp};

// Help command text
const help = {
  type: Discord.ApplicationCommandType.ChatInput,
  text: `Allows a server admin to get information about a role in the server.`,
  level: `admin`,
  allowDM: false,
  options: [
    {
      name: `role`,
      type: Discord.ApplicationCommandOptionType.Role,
      description: `The role to get information on.`,
      required: true,
    },
  ],
};

// Exported functions
async function handle(client, interaction) {
  if (!interaction.channel) {
    replyHelper.interactionReply(interaction, {content: `This command has to be used in a server.`, ephemeral: true});
    return;
  }

  try {
    const role = interaction.options.get(`role`).role;
    const embed = new Discord.EmbedBuilder();

    embed.setColor(role.color);
    embed.setAuthor({name: `${role.name} Role Information`, iconURL: interaction.guild.iconURL()});
    embed.setTimestamp(role.createdTimestamp);
    embed.setFooter({text: `Role Created`});
    
    const embedFields = [];

    embedFields.push({ name: `__Total Members__`, value: `${role.members.size} member${role.members.size > 1 ? `s` : ``}  (${(role.members.size / interaction.guild.memberCount * 100).toFixed(2)}% of all server members)` });

    embedFields.push({ name: `__Color (hex)__`, value: `\`${role.hexColor}\`` });

    embedFields.push({ name: `__Mentionable__`, value: role.mentionable ? `Yes` : `No` });

    embedFields.push({ name: `__Externally Managed__`, value: role.managed ? `Yes` : `No` });

    embed.setFields(embedFields);

    replyHelper.interactionReply(interaction, {embeds: [embed]});
  } catch {
    replyHelper.interactionReply(interaction, {content: `Command timed out, please try again.`, ephemeral: true});
  }
}

function getHelp() {
  return help;
}
