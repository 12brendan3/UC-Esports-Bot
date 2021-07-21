// Exports
module.exports = {handle, getHelp};

// Help command text
const help = {
  text: `Sends a cat picture with the specified text.`,
  level: `secret`,
  options: [
    {
      name: `text`,
      type: `STRING`,
      description: `The text to put on the image.`,
      required: true,
    },
  ],
};

// Exported functions
function handle(client, interaction) {
  const text = encodeURI(interaction.options.get(`text`).value);

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
