// Exports
module.exports = {handle, getHelp};

// Help command text -- command disabled for now
const help = {
  text: `Sends Malavika's (Mika's) biography.`,
  level: `secret`,
};

// Exported functions
function handle(client, interaction) {
  interaction.reply({
    content: `Malavika "Mika" Kumar was born on March 5, 1999 in Edgewood, Kentucky. She moved to Cincinnati, Ohio in 2012 because her mother wanted her to attend Walnut Hills High School, where she graduated from in May 2017. She currently attends the University of Cincinnati to pursue a double major in fine arts (with a certificate in game art) and art history. She lives a simple life and is only relevant because she is the first female and longest reigning president of UC Esports. She has been in the club since 2017, its first year. How she climbed the ranks of the executive board is unknown, but her reign of terror will end in April 2022 when a new soul must fill in her size 11 shoes. After graduating, Mika plans on settling down with her longtime boyfriend, Michael "StoneyB" Clark, and their Shepsky, Luna.`,
  });
}

function getHelp() {
  return help;
}
