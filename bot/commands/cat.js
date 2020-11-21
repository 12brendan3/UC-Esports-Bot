// Exports
module.exports = {handle, getHelp};

// Help command text
const help = null;

// Exported functions
function handle(client, msg) {
  try {
    msg.channel.send({files: [{attachment: `https://cataas.com/c`, name: `cat.jpeg`}]});
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
