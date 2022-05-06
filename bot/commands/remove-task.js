const database = require(`../helpers/database-manager`);
const taskManager = require(`../helpers/task-manager`);
const replyHelper = require(`../helpers/interaction-helper`);

// Exports
module.exports = {handle, getHelp};

// Help command text
const help = {
  text: `Allows an admin to remove server tasks.`,
  level: `admin`,
  allowDM: false,
  options: [
    {
      name: `taskid`,
      type: `STRING`,
      description: `The ID of the task to remove.`,
      required: true,
    },
  ],
};

// Exported functions
async function handle(client, interaction) {
  if (interaction.channel.type === `DM`) {
    replyHelper.interactionReply(interaction, {content: `This command has to be used in a server.`, ephemeral: true});
    return;
  }

  const existingTasks = await database.getAllEntries(`Tasks`, {guildID: interaction.guildId});

  if (existingTasks.length < 1) {
    replyHelper.interactionReply(interaction, {content: `There are no tasks in this server.`, ephemeral: true});
    return;
  }

  const taskID = interaction.options.get(`taskid`).value;

  const result = await database.getEntry(`Tasks`, {ID: taskID, guildID: interaction.guildId});

  if (!result) {
    replyHelper.interactionReply(interaction, {content: `No task with that ID found, try again.`, ephemeral: true});
    return;
  }

  const resultRemoval = await taskManager.removeTask(taskID, result.taskFile);

  if (resultRemoval) {
    replyHelper.interactionReply(interaction, {content: `Successfully removed the task.`, ephemeral: true});
  } else {
    replyHelper.interactionReply(interaction, {content: `Failed to remove the task, let the bot devs know if the issue persists.`, ephemeral: true});
  }
}

function getHelp() {
  return help;
}
