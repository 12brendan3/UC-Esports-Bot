// Exports
module.exports = {handle, getHelp};

// Help command text
const help = {
  text: `Sends a cat gif in chat.`,
  level: `user`,
};

// Exported functions
function handle(client, interaction) {
  try {
    interaction.channel.send({files: [{attachment: `https://cataas.com/c/g`, name: `cat.gif`}]});
    interaction.reply({content: `Sent!`, ephemeral: true});
  } catch (err) {
    interaction.reply({content: `There was an error running the command.`, ephemeral: true});
    console.error(err);
  }
}

function getHelp() {
  return help;
}
