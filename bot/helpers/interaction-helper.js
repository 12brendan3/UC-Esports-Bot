// Exports
module.exports = {interactionReply, interactionEdit};

// Functions
async function interactionReply(interaction, message) {
  try {
    const inter = await interaction.reply(message);
    return inter;
  } catch (err) {
    console.error(err);
  }
}

async function interactionEdit(interaction, message) {
  try {
    const inter = await interaction.editReply(message);
    return inter;
  } catch (err) {
    console.error(err);
  }
}
