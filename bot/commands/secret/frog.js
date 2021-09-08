// Exports
module.exports = {handle, getHelp};

// Help command text
const help = {
  text: `Sends a random frog image in chat.`,
  level: `secret`,
};

// Exported functions
function handle(client, interaction) {
  try {
    const random = Math.floor(Math.random() * 54);
    interaction.channel.send({files: [{attachment: `http://www.allaboutfrogs.org/funstuff/random/${(random + ``).padStart(4, `0`)}.jpg`, name: `frog.jpg`}]});
    interaction.reply({content: `Sent!`, ephemeral: true});
  } catch (err) {
    interaction.reply({content: `There was an error running the command.`, ephemeral: true});
    console.error(err);
  }
}

function getHelp() {
  return help;
}