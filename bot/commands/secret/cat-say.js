// Exports
module.exports = {handle, getHelp};

// Help command text
const help = {
  text: `Sends a cat picture with the specified text.`,
  level: `secret`,
};

// Exported functions
function handle(client, interaction) {
  if (!interaction.options.get(`option1`)) {
    interaction.reply({content: `Please provide something for the cat to say.`, ephemeral: true});
    return;
  }

  const text = encodeURI(interaction.options.get(`option1`).value);

  try {
    interaction.channel.send({files: [{attachment: `https://cataas.com/c/s/${text}`, name: `cat.jpeg`}]});
    interaction.reply({content: `Sent!`, ephemeral: true});
  } catch (err) {
    interaction.reply({content: `There was an error running the command.`, ephemeral: true});
    console.error(err);
  }
}

function getHelp() {
  return help;
}
