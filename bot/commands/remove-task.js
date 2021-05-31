const permissions = require(`../helpers/permissions`);
const database = require(`../helpers/database-manager`);
const taskManager = require(`../helpers/task-manager`);
const collectors = require(`../helpers/collectors`);

// Exports
module.exports = {handle, getHelp};

// Help command text
const help = {
  text: `Allows an admin to remove server tasks.`,
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

  let tasksString = `What task would you like to remove? (Reply with the ID)\n\`\`\`\n`;

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

  let taskIDMsg;
  try {
    taskIDMsg = await collectors.oneMessageFromUser(msg.channel, msg.author.id);
  } catch {
    msg.reply(`Command timed out, please try again.`);
    return;
  }

  const taskID = taskIDMsg.first().content;

  const result = await database.getEntry(`Tasks`, {ID: taskID, guildID: msg.guild.id});

  if (!result) {
    msg.reply(`No task with that ID found, try again.`);
    return;
  }

  const resultRemoval = await taskManager.removeTask(taskID, `${taskID}.${result.taskFile}`);

  if (resultRemoval) {
    msg.reply(`Successfully removed the task.`);
  } else {
    msg.reply(`Failed to remove the task, let the bot devs know if the issue persists.`);
  }
}

function getHelp() {
  return help;
}
