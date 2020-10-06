// Exports
module.exports = {oneMessageFromUser, oneReactionFromUser};

// Exported Functions
async function oneMessageFromUser(channel, authorID, time) {
  const filter = (message) => message.author.id === authorID;

  const collected = await channel.awaitMessages(filter, {max: 1, time: time || 60000, errors: [`time`]});

  return collected;
}

async function oneReactionFromUser(msg, userID, time) {
  const filter = (reaction, user) => user.id === userID;

  const collected = await msg.awaitReactions(filter, {max: 1, time: time || 60000, errors: [`time`]});

  return collected;
}
