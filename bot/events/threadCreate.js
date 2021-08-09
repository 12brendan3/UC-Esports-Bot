// Exports
module.exports = {handle};

// Exported function
function handle(client, thread) {
  thread.join();
}
