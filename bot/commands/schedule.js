const collectors = require(`../helpers/collectors`);
const taskManager = require(`../helpers/task-manager`);
const axios = require(`axios`);
const path = require(`path`);
const cronos = require(`cronosjs`);
const fs = require(`fs`);
const replyHelper = require(`../helpers/interaction-helper`);

// Exports
module.exports = {handle, getHelp};

// Help command text
const help = {
  text: `Allows an admin to schedule a new task.`,
  level: `admin`,
  allowDM: false,
  options: [
    {
      name: `channel`,
      type: `CHANNEL`,
      description: `The channel to send the message and/or image in.`,
      required: true,
    },
    {
      name: `cron`,
      type: `STRING`,
      description: `The cron string for this task.`,
      required: true,
    },
    {
      name: `image`,
      type: `BOOLEAN`,
      description: `Whether or not to attach an image to this task.`,
      required: true,
    },
    {
      name: `message`,
      type: `STRING`,
      description: `The message to send.`,
      required: false,
    },
  ],
};

// Exported functions
async function handle(client, interaction) {
  if (!interaction.channel) {
    replyHelper.interactionReply(interaction, {content: `This command has to be used in a server.`, ephemeral: true});
    return;
  }

  if (!interaction.options.get(`channel`).channel || interaction.options.get(`channel`).channel.type !== `GUILD_TEXT`) {
    replyHelper.interactionReply(interaction, {content: `That's not a valid text channel.`, ephemeral: true});
    return;
  }

  const cronString = interaction.options.get(`cron`).value;
  const cronSplit = cronString.split(` `);
  if (!cronos.validate(cronString) || (cronSplit.length > 5 && isNaN(cronSplit[0]))) {
    replyHelper.interactionReply(interaction, {content: `That isn't a valid cron string, please try again.`, ephemeral: true});
    return;
  }

  let taskImg;
  let task;
  if (interaction.options.get(`image`).value) {
    try {
      replyHelper.interactionReply(interaction, {content: `Please send an image for the task now.`, ephemeral: true});
      taskImg = await collectors.oneMessageFromUser(interaction.channel, interaction.user.id, 600000);
    } catch {
      interaction.followUp({content: `Command timed out, please try again.`, ephemeral: true});
      return;
    }

    task = taskImg.first();

    if (task.attachments.size > 0 && verifyImage(task) !== `valid`) {
      interaction.followUp({content: `That isn't a valid image, please try again.`, ephemeral: true});
      return;
    }
  } else if (!interaction.options.has(`message`)) {
    replyHelper.interactionReply(interaction, {content: `The task needs to at least send something, please try again.`, ephemeral: true});
    return;
  }

  const result = await taskManager.addTask(interaction.options.get(`channel`).channel, cronString, interaction.options.has(`message`) ? interaction.options.get(`message`).value : null, task ? path.extname(task.attachments.first().name) : null);

  if (result) {
    if (task) {
      const res = await axios({method: `get`, url: task.attachments.first().proxyURL, responseType: `stream`});
      await res.data.pipe(fs.createWriteStream(`./storage/task-files/${result.ID}.${result.taskFile}`));
    }

    if (interaction.options.get(`image`).value) {
      if (task.deletable) {
        task.delete();
      }
      interaction.followUp({content: `Task added!`, ephemeral: true});
      return;
    }
    replyHelper.interactionReply(interaction, {content: `Task added!`, ephemeral: true});
  } else {
    if (interaction.options.get(`image`).value) {
      if (task.deletable) {
        task.delete();
      }
      interaction.followUp({content: `Failed to add task, let the bot devs know if the issue persists.`, ephemeral: true});
      return;
    }
    replyHelper.interactionReply(interaction, {content: `Failed to add task, let the bot devs know if the issue persists.`, ephemeral: true});
  }
}

function getHelp() {
  return help;
}

function verifyImage(msg) {
  const img = msg.attachments.first();
  const fileExt = path.extname(img.name).toLowerCase();

  if (fileExt !== `.png` && fileExt !== `.jpg` && fileExt !== `.jpeg` && fileExt !== `.gif`) {
    return `That isn't a valid image type, please try again.`;
  }

  if (img.size > 8000000) {
    return `That image is too large, please try again.`;
  }

  return `valid`;
}
