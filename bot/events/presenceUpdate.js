// Exports
module.exports = {handle};

// Exported function
function handle(client, oldPresence, newPresence) {
  console.log(`\n\nGot a presence update for the user: ${newPresence.user.username}`);

  if (newPresence) {
    checkStreaming(newPresence);
  }
}

// Private Functions
function checkStreaming(presence) {
  let streaming = false;
  for (let i = 0; i < presence.activities.length > 0; i++) {
    if (presence.activities[i].type === 'LISTENING') {
      streaming = true;
      break;
    }
  }

  if (streaming === true) {
    // Give streaming role here
  } else {
    // Remove streaming role here
  }
}
