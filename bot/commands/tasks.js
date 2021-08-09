const permissions = require(`../helpers/permissions`);
const database = require(`../helpers/database-manager`);

// Exports
module.exports = {handle, getHelp};

// Help command text
const help = {
  text: `Allows an admin to view server tasks.`,
  level: `admin`,
};

// Exported functions
async function handle(client, interaction) {
  if (interaction.channel.type === `dm`) {
    interaction.reply({content: `This command has to be used in a server.`, ephemeral: true});
    return;
  }

  let isAdmin = false;
  try {
    isAdmin = await permissions.checkAdmin(interaction.guild, interaction.user.id);
  } catch {
    interaction.reply({content: `There was an error, please try again.`, ephemeral: true});
  }

  if (!isAdmin) {
    interaction.reply({content: `You're not an admin on this server.`, ephemeral: true});
    return;
  }

  const existingTasks = await database.getAllEntries(`Tasks`, {guildID: interaction.guildId});

  if (existingTasks.length < 1) {
    interaction.reply(`There are no tasks in this server.`);
    return;
  }

  let tasksString = `The following tasks exist in this server:\n\`\`\`\n`;

  for (let i = 0; i < existingTasks.length; i++) {
    const channel = interaction.guild.channels.cache.get(existingTasks[i].channelID);
    let hasWhat = `Message + Image`;

    if (!existingTasks[i].taskMessage) {
      hasWhat = `Image`;
    } else if (!existingTasks[i].taskFile) {
      hasWhat = `Message`;
    }

    tasksString += `Channel: #${channel.name};  Cron: ${existingTasks[i].cronString};  Has: ${hasWhat};  ID: ${existingTasks[i].ID}\n`;
  }

  tasksString += `\`\`\``;

  interaction.reply(tasksString);
}

function getHelp() {
  return help;
}
