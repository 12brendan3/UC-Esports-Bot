const database = require(`../helpers/database-manager`);
const taskManager = require(`../helpers/task-manager`);

// Exports
module.exports = {handle, getHelp};

// Help command text
const help = {
  text: `Allows an admin to remove server tasks.`,
  level: `admin`,
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
  if (interaction.channel.type === `dm`) {
    interaction.reply({content: `This command has to be used in a server.`, ephemeral: true});
    return;
  }

  const existingTasks = await database.getAllEntries(`Tasks`, {guildID: interaction.guildId});

  if (existingTasks.length < 1) {
    interaction.reply({content: `There are no tasks in this server.`, ephemeral: true});
    return;
  }

  const taskID = interaction.options.get(`taskid`).value;

  const result = await database.getEntry(`Tasks`, {ID: taskID, guildID: interaction.guildId});

  if (!result) {
    interaction.reply({content: `No task with that ID found, try again.`, ephemeral: true});
    return;
  }

  const resultRemoval = await taskManager.removeTask(taskID, result.taskFile);

  if (resultRemoval) {
    interaction.reply({content: `Successfully removed the task.`, ephemeral: true});
  } else {
    interaction.reply({content: `Failed to remove the task, let the bot devs know if the issue persists.`, ephemeral: true});
  }
}

function getHelp() {
  return help;
}
