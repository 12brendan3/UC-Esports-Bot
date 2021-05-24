// Exports
module.exports = {handle, getHelp};

// Help command text
const help = null;

// Exported functions
function handle(client, msg) {
  try {
    msg.channel.send({files: [{attachment: `https://cataas.com/c/g`, name: `cat.gif`}]});
  } catch (err) {
    msg.reply(`There was an error running the command.`);
    console.error(err);
  }

  if (msg.deletable) {
    msg.delete();
  }
}

function getHelp() {
  return help;
}
