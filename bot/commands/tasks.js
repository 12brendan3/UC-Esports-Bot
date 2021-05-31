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
async function handle(client, msg) {
  if (msg.channel.type === `dm`) {
    msg.reply(`This command has to be used in a server.`);
    return;
  }

  let isAdmin = false;
  try {
    isAdmin = await permissions.checkAdmin(msg.guild, msg.author.id);
  } catch {
    msg.reply(`Command timed out, please try again.`);
  }

  if (!isAdmin) {
    msg.reply(`You're not an admin on this server.`);
    return;
  }

  const existingTasks = await database.getAllEntries(`Tasks`, {guildID: msg.guild.id});

  if (existingTasks.length < 1) {
    msg.reply(`There are no tasks in this server.`);
    return;
  }

  let tasksString = `The following tasks exist in this server:\n\`\`\`\n`;

  for (let i = 0; i < existingTasks.length; i++) {
    const channel = msg.guild.channels.cache.get(existingTasks[i].channelID);
    let hasWhat = `Message + Image`;

    if (!existingTasks[i].taskMessage) {
      hasWhat = `Image`;
    } else if (!existingTasks[i].taskFile) {
      hasWhat = `Message`;
    }

    tasksString += `Channel: #${channel.name};  Cron: ${existingTasks[i].cronString};  Has: ${hasWhat};  ID: ${existingTasks[i].ID}\n`;
  }

  tasksString += `\`\`\``;

  msg.reply(tasksString);
}

function getHelp() {
  return help;
}
