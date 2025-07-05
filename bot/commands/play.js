// Imports
const Discord = require(`discord.js`);

const playerManager = require(`../helpers/player-manager`);

// Exports
module.exports = {handle, getHelp};

// Help command text
const help = {
  type: Discord.ApplicationCommandType.ChatInput,
  text: `Plays audio from YouTube.  Adds to queue or resumes paused audio.`,
  level: `user`,
  allowDM: false,
  options: [
    {
      name: `ytsearch`,
      description: `The URL or search term.  Only needed when adding to queue.`,
      type: Discord.ApplicationCommandOptionType.String,
      required: false,
    },
  ],
};

// Exported functions
function handle(client, interaction) {
  playerManager.checkUser(interaction, `play`);
}

function getHelp() {
  return help;
}
