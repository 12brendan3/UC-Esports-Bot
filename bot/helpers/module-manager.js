const fs = require('fs');
const path = require('path');

const eventImports = {};
const commandImports = {};

// Exports
module.exports = {registerAll, commandImports};

// Exported functions
function registerAll(client) {
  registerEvents(client);
}

// Private Functions
function registerEvents(client) {
  const events = fs.readdirSync('./bot/events');

  for (let i = 0; i < events.length; i++) {
    const eventName = path.basename(events[i], '.js');

    eventImports[eventName] = require(`../events/${events[i]}`);

    client.on(eventName, (eventData, eventData2) => {
      eventImports[eventName].handle(client, eventData, eventData2);
    });

    console.info(`Loaded event: ${eventName}`);
  }
}
