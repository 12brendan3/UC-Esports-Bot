const settings = require(`../helpers/settings-manager`);
const database = require(`../helpers/database-manager`);

const xpWhitelist = new Set([`313455932896182283`, `772589330710659083`, `403356697327828995`, `725015061315190864`, `734896597518909610`, `703805091525951509`]);

// Exports
module.exports = {handle};

// Exported function
function handle(client, msg) {
  if (msg.content.startsWith(settings.getSettings().prefix)) {
    msg.reply(`Please use slash (\`/\`) commands.\nPrefix-based chat commands are no longer supported.`);
    return;
  }

  if (!msg.author.bot && msg.channel.type !== `DM`) {
    awardXP(msg);
  }
}

async function awardXP(msg) {
  if (!xpWhitelist.has(msg.guildId)) {
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