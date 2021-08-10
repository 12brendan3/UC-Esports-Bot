const database = require(`../helpers/database-manager`);
const permissions = require(`../helpers/permissions`);

// Exports
module.exports = {handle, getHelp};

const help = {
  text: `Allows you to sign into events.`,
  level: `user`,
  options: [
    {
      name: `signInCode`,
      type: `STRING`,
      description: `Code for Event`,
      required: true,
    },
  ],
};

async function handle(client, interaction) {
  const code = interaction.options.get(`signInCode`).value;

  const event = await database.getEntry(`Events`, {signInCode: code});

  if (!event) {
    interaction.reply({content: `Invalid code`, ephemeral: true});
  } else {
    await database.createEntry(`Registrants`, {
      eventID: event.ID,
      userID: interaction.user.id,
      registrationTime: Date.now(),
    });

    interaction.reply({content: `Registration to ${event.eventName} successful`});
  }


}

function getHelp() {
  return help;
}