// Exports
module.exports = {handle, getHelp};

// Help command text
const help = {
  text: `Sends a crab emoji in chat.`,
  level: `user`,
};

// Exported functions
function handle(client, interaction) {
  interaction.channel.send(`🦀`);
  interaction.reply({content: `Sent!`, ephemeral: true});
}

function getHelp() {
  return help;
}
