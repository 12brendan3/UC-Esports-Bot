const database = require(`./database-manager`);
const cronos = require(`cronosjs`);
const Discord = require(`discord.js`);
const fs = require(`fs`);
const tasks = new Map();

module.exports = {registerExisting, addTask, removeTask};

async function registerExisting(client) {
  console.info(`Fetching existing tasks...`);
  const existingTasks = await database.getAllEntries(`Tasks`);

  console.info(`Registering existing tasks...`);
  for (let i = 0; i < existingTasks.length; i++) {
    const guild = client.guilds.cache.get(existingTasks[i].guildID);
    const channel = guild ? guild.channels.cache.get(existingTasks[i].channelID) : false;
    if (channel) {
      if (existingTasks[i].taskFile) {
        const file = new Discord.MessageAttachment(`./storage/task-files/${existingTasks[i].ID}.${existingTasks[i].taskFile}`, `${existingTasks[i].ID}.${existingTasks[i].taskFile}`);
        registerTask(existingTasks[i].ID, channel, existingTasks[i].taskMessage, file, existingTasks[i].cronString);
      } else {
        registerTask(existingTasks[i].ID, channel, existingTasks[i].taskMessage, existingTasks[i].taskFile, existingTasks[i].cronString);
      }
    }
  }
  console.info(`Existing tasks registered.`);
}

function registerTask(taskID, channel, message, file, cronString) {
  const cronTask = cronos.scheduleTask(cronString, () => {
    if (message && file) {
      channel.send({content: message, files: [file]});
    } else if (file) {
      channel.send({files: [file]});
    } else {
      channel.send(message);
    }
  });
  tasks.set(taskID, cronTask);
}

async function addTask(channel, cronString, taskMessage, taskFile) {
  const result = await database.createEntry(`Tasks`, {guildID: channel.guild.id, channelID: channel.id, cronString, taskMessage, taskFile});
  if (result) {
    let file = null;
    if (taskFile) {
      file = new Discord.MessageAttachment(`./storage/task-files/${result.ID}.${result.taskFile}`, `${result.ID}.${result.taskFile}`);
    }
    registerTask(result.ID, channel, taskMessage, file, cronString);
  }
  return result;
}

async function removeTask(taskID, file) {
  const result = await database.removeEntry(`Tasks`, {ID: taskID});
  if (result) {
    const task = tasks.get(taskID);
    task.stop();
    if (file && fs.existsSync(`./storage/task-files/${taskID}.${file}`)) {
      fs.unlinkSync(`./storage/task-files/${taskID}.${file}`);
    }
    return true;
  } else {
    return false;
  }
}
