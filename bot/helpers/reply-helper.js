// Exports
module.exports = {interactionReply};

// Functions
async function interactionReply(interaction, message) {
  try {
    const inter = await interaction.reply(message);
    return inter;
  } catch (err) {
    console.error(err);
  }
}
