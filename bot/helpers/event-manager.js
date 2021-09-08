const fs = require(`fs`);
const path = require(`path`);

const eventImports = new Map();

// Exports
module.exports = {loadAll, clearAll};

// Exported functions
function clearAll() {
  for (const event of eventImports.keys()) {
    delete require.cache[require.resolve(`../events/${event}.js`)];
  }

  eventImports.clear();
}

function loadAll(client) {
  const events = fs.readdirSync(`./bot/events`);

  for (let i = 0; i < events.length; i++) {
    const eventName = path.basename(events[i], `.js`);

    eventImports.set(eventName, require(`../events/${events[i]}`));

    registerEvent(client, eventName);

    console.info(`Loaded event: ${eventName}`);
  }
}

// Private functions
function registerEvent(client, eventName) {
  client.on(eventName, async (eventData, eventData2) => {
    if (eventData && eventData.partial) {
      try {
        await eventData.fetch();
      } catch (error) {
        return;
      }
    }

    if (eventData2 && eventData2.partial) {
      try {
        await eventData2.fetch();
      } catch (error) {
        return;
      }
    }

    eventImports.get(eventName).handle(client, eventData, eventData2);
  });
}