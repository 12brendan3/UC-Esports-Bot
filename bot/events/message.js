const settings = require(`../helpers/settings-manager`);
const modules = require(`../helpers/module-manager`);
const database = require(`../helpers/database-manager`);

const WordFilter = require('bad-words');

const filter = new WordFilter();

const xpWhitelist = new Set([`313455932896182283`, `772589330710659083`, `403356697327828995`]);
const profaneWhitelist = new Set([`772589330710659083`]);

// Exports
module.exports = {handle};

// Exported function
function handle(client, msg) {
  if (!msg.author.bot && msg.content.startsWith(settings.getSettings().prefix)) {
    handleCommand(client, msg);
  } else if (!msg.author.bot && msg.channel.type !== `dm`) {
    awardXP(msg);
  }

  checkProfane(msg);
}

// Private functions
function handleCommand(client, msg) {
  // Ignore report command to keep it as anonymous as possible
  if (!msg.content.startsWith(`${settings.getSettings().prefix}ticket`)) {
    console.info(`${msg.guild === null ? `Via DM` : `#${msg.channel.name}`} <${msg.author.username}> ${msg.content}`);
  }

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
  if (!xpWhitelist.has(msg.guild.id)) {
    return;
  }

  const result = await database.getEntry(`XP`, {userID: msg.author.id});

  const time = Date.now();

  if ((result && result.lastXP + 60000 <= time) || !result) {
    let newXP = Math.ceil(Math.random() * 5);

    if (result && result.XP) {
      newXP = result.XP + newXP;
    }

    database.updateOrCreateEntry(`XP`, {userID: msg.author.id}, {XP: newXP, lastXP: time});
  }
}

function checkProfane(msg) {
  if (!msg.guild || !profaneWhitelist.has(msg.guild.id)) {
    return;
  }

  if (filter.isProfane(msg.content) && msg.deletable) {
    msg.delete();
  }
}
