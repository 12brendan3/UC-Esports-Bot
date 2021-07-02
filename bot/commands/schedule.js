const permissions = require(`../helpers/permissions`);
const collectors = require(`../helpers/collectors`);
const resolvers = require(`../helpers/resolvers`);
const taskManager = require(`../helpers/task-manager`);
const axios = require(`axios`);
const path = require(`path`);
const cronos = require(`cronosjs`);
const fs = require(`fs`);

// Exports
module.exports = {handle, getHelp};

// Help command text
const help = {
  text: `Allows an admin to schedule a new task.`,
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

  msg.reply(`What channel is this task for?`);
  let channelMsg;
  try {
    channelMsg = await collectors.oneMessageFromUser(msg.channel, msg.author.id);
  } catch {
    msg.reply(`Command timed out, please try again.`);
    return;
  }

  const channelID = resolvers.resolveChannelID(msg.guild, channelMsg.first().content);
  const channel = msg.guild.channels.cache.get(channelID);

  if (!channel) {
    msg.reply(`Couldn't find that channel, please try again.`);
    return;
  }

  msg.reply(`What would you like the task to say?\nYou may also or alternatively attach an image.`);
  let taskMsg;
  try {
    taskMsg = await collectors.oneMessageFromUser(msg.channel, msg.author.id, 600000);
  } catch {
    msg.reply(`Command timed out, please try again.`);
    return;
  }

  const task = taskMsg.first();

  if (task.attachments.size > 0 && verifyImage(task) !== 'valid') {
    msg.reply(`That isn't a valid image, please try again.`);
    return;
  }

  msg.reply(`When should this task trigger?\nCurrently only cron strings are supported.`);

  let cronMsg;
  try {
    cronMsg = await collectors.oneMessageFromUser(msg.channel, msg.author.id);
  } catch {
    msg.reply(`Command timed out, please try again.`);
    return;
  }

  const cronString = cronMsg.first().content;
  const cronSplit = cronString.split(` `);

  if (!cronos.validate(cronString) || (cronSplit.length > 5 && isNaN(cronSplit[0]))) {
    msg.reply(`That isn't a valid cron string, please try again.`);
    return;
  }

  const result = await taskManager.addTask(channel, cronString, task.content, task.attachments.size > 0 ? path.extname(task.attachments.first().name) : null);

  if (result) {
    if (task.attachments.size > 0) {
      const res = await axios({method: 'get', url: task.attachments.first().proxyURL, responseType: `stream`});
      await res.data.pipe(fs.createWriteStream(`./storage/task-files/${result.ID}.${result.taskFile}`));
    }

    msg.reply(`Task added!`);
  } else {
    msg.reply(`Failed to add task, let the bot devs know if the issue persists.`);
  }
}

function getHelp() {
  return help;
}

function verifyImage(msg) {
  const img = msg.attachments.first();
  const fileExt = path.extname(img.name).toLowerCase();

  if (fileExt !== '.png' && fileExt !== '.jpg' && fileExt !== '.jpeg' && fileExt !== '.gif') {
    return `That isn't a valid image type, please try again.`;
  }

  if (img.size > 8000000) {
    return `That image is too large, please try again.`;
  }

  return 'valid';
}
