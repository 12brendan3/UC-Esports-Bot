// Exports
module.exports = {handle};

// Exported function
function handle(client, msg) {
  console.log(`${msg.channel.name} <${msg.author.username}> ${msg.content}`);
  if (msg.content.startsWith('bc!ping')) {
    msg.reply('pong!');
  }
}
