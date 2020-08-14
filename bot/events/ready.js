// Exports
module.exports = {handle};

// Exported Function
function handle(client) {
  console.log(`Bot ready!\nLogged in as: ${client.user.username}`);
}
