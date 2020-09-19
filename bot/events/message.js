const settings = require(`../helpers/settings-manager`);
const modules = require(`../helpers/module-manager`);
const database = require(`../helpers/database-manager`);

// Exports
module.exports = {handle};

// Exported function
function handle(client, msg) {
  if (!msg.author.bot && msg.content.startsWith(settings.getSettings().prefix)) {
    handleCommand(client, msg);
  } else if (!msg.author.bot) {
    awardXP(msg);
  }
}

// Private function
function handleCommand(client, msg) {
  console.info(`#${msg.channel.name} <${msg.author.username}> ${msg.content}`);

  let command = msg.content.substr(settings.getSettings().prefix.length);

  if (msg.content.includes(` `)) {
    command = command.split(` `)[0];
  }

  const commands = modules.getCommands();

  if (commands[command]) {
    commands[command].handle(client, msg);
  } else {
    msg.reply(`unknown command.`);
  }
}

async function awardXP(msg) {
  const result = await database.getEntry(`XP`, {userID: msg.author.id});

  const time = Date.now();

  if ((result && result.lastXP + 60000 <= time) || !result) {
    let newXP = rollXP();

    if (result && result.XP) {
      newXP = result.XP + newXP;
    }

    database.updateOrCreateEntry(`XP`, {userID: msg.author.id}, {XP: newXP, lastXP: time});
  }
}

function rollXP() {
  return Math.ceil(Math.random() * 5);
}
