// Exports
module.exports = {handle, getHelp};

// Help command text
const help = null;

// Import module
const settings = require(`../helpers/settings-manager`);

// Exported functions
function handle(client, msg) {
  const text = encodeURI(msg.content.substr(8 + settings.getSettings().prefix.length));

  try {
    msg.channel.send({files: [{attachment: `https://cataas.com/c/s/${text}`, name: `cat.jpeg`}]});
  } catch (err) {
    msg.reply(`there was an error running the command.`);
    console.error(err);
  }

  if (msg.deletable) {
    msg.delete();
  }
}

function getHelp() {
  return help;
}
