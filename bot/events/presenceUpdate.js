const database = require("../helpers/database-manager");

// Exports
module.exports = {handle};

// Exported function
function handle(client, oldPresence, newPresence) {
  if (newPresence) {
    checkStreaming(newPresence);
  }
}

// Private Functions
async function checkStreaming(presence) {
  const guildSettings = await database.getEntry(`Guilds`, {guildID: presence.guild.id});

  if (guildSettings && guildSettings.streamingRoleID) {
    let streaming = false;
    for (let i = 0; i < presence.activities.length > 0; i++) {
      if (presence.activities[i].type === `STREAMING`) {
        streaming = true;
        break;
      }
    }

    const hasRole = presence.member.roles.cache.get(guildSettings.streamingRoleID);

    if (streaming && !hasRole) {
      presence.member.roles.add(guildSettings.streamingRoleID, `Detected a livestream.`);
    } else if (!streaming && hasRole) {
      presence.member.roles.remove(guildSettings.streamingRoleID, `Detected no livestream.`);
    }
  }
}
