const commandManager = require(`../helpers/command-manager`);
const database = require(`../helpers/database-manager`);
const reactManager = require(`../helpers/role-react-manager-2`);
const replyHelper = require(`../helpers/interaction-helper`);

// Exports
module.exports = {handle};

// Exported function
function handle(client, interaction) {
  if (interaction.isCommand() || interaction.isContextMenu()) {
    handleCommand(client, interaction);
  } else if (interaction.isButton()) {
    handleButton(client, interaction);
  }
}

function handleCommand(client, interaction) {
  // Ignore report command to keep it as anonymous as possible
  if (interaction.commandName !== `ticket`) {
    console.info(`${interaction.channel ? `#${interaction.channel.name}` : `Via DM`} <${interaction.user.username}> ${interaction.commandName}`);
  }

  const commands = commandManager.getAll();

  commands.get(interaction.commandName).handle(client, interaction);
}

async function handleButton(client, interaction) {
  if (interaction.user.bot || interaction.channel.type === `DM`) {
    return;
  }

  const guildSettings = await database.getEntry(`Guilds`, {guildID: interaction.guildId});

  if (!guildSettings || !guildSettings.rolesChannelID) {
    return;
  }

  const roleData = reactManager.getRoleData();

  if (!roleData[interaction.guildId]) {
    return;
  }

  for (const category in roleData[interaction.guildId]) {
    if (Object.prototype.hasOwnProperty.call(roleData[interaction.guildId], category) && roleData[interaction.guildId][category].msgID === interaction.message.id) {
      const emoji = interaction.customId;
      const roleID = roleData[interaction.guildId][category].roles[emoji];

      if (roleID) {
        const member = interaction.member;
        const role = interaction.member.guild.roles.cache.get(roleID);

        try {
          if (member.roles.cache.get(roleID)) {
            await member.roles.remove(roleID, `User requested role removal.`);
            replyHelper.interactionReply(interaction, {content: `You no longer have the \`${role.name}\` role.`, ephemeral: true});
          } else {
            await member.roles.add(roleID, `User requested role addition.`);
            replyHelper.interactionReply(interaction, {content: `You have been given the \`${role.name}\` role.`, ephemeral: true});
          }
        } catch {
          const message = await replyHelper.interactionReply(interaction, {content: `${member}, there was an error giving you the \`${role.name}\` role.\nTell an admin if they don't notice.  There may be a permission issue.`, ephemeral: false});
          setTimeout(() => message.delete(), 10000);
        }
        break;
      }
    }
  }
}
