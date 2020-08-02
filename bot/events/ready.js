module.exports = {handle};

function handle(client) {
  console.log(`Bot ready!\nLogged in as: ${client.user.username}`);
}
