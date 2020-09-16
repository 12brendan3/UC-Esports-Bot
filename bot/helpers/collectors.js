// Exports
module.exports = {oneMessageFromUser};

// Exported Functions
async function oneMessageFromUser(channel, authorID) {
  const filter = (message) => message.author.id === authorID;
  const collected = await channel.awaitMessages(filter, {max: 1, time: 60000, errors: [`time`]});
  return collected;
}
