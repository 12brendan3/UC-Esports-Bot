const fs = require(`fs`);
const path = require(`path`);

let eventImports = {};
let commandImports = {};

// Exports
module.exports = {registerAll, getCommands, reloadCommands, clearAll, reloadCommand};

// Exported functions
function registerAll(client) {
  loadCommands();
  registerEvents(client);
}

function getCommands() {
  return commandImports;
}

function reloadCommands() {
  const commands = fs.readdirSync(`./bot/commands`);

  for (let i = 0; i < commands.length; i++) {
    const commandName = path.basename(commands[i], `.js`);

    delete require.cache[require.resolve(`../commands/${commands[i]}`)];
    delete commandImports[commandName];

    commandImports[commandName] = require(`../commands/${commands[i]}`);

    console.info(`Reloaded command: ${commandName}`);
  }
}

function clearAll() {
  eventImports.ready.clear();

  eventImports = {};
  commandImports = {};

  const commands = fs.readdirSync(`./bot/commands`);
  for (let i = 0; i < commands.length; i++) {
    delete require.cache[require.resolve(`../commands/${commands[i]}`)];
  }
}

function reloadCommand(command) {
  const commands = fs.readdirSync(`./bot/commands`);

  if (commands.includes(`${command}.js`)) {
    delete require.cache[require.resolve(`../commands/${command}.js`)];
    delete commandImports[command];

    commandImports[command] = require(`../commands/${command}.js`);

    console.info(`Reloaded command: ${command}`);
  } else {
    console.info(`No command found for: ${command}`);
  }
}

// Private functions
function registerEvents(client) {
  const events = fs.readdirSync(`./bot/events`);

  for (let i = 0; i < events.length; i++) {
    const eventName = path.basename(events[i], `.js`);

    eventImports[eventName] = require(`../events/${events[i]}`);

    registerEvent(client, eventName);

    console.info(`Loaded event: ${eventName}`);
  }
}

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

    eventImports[eventName].handle(client, eventData, eventData2);
  });
}

function loadCommands() {
  const commands = fs.readdirSync(`./bot/commands`);

  for (let i = 0; i < commands.length; i++) {
    const commandName = path.basename(commands[i], `.js`);

    commandImports[commandName] = require(`../commands/${commands[i]}`);

    console.info(`Loaded command: ${commandName}`);
  }
}
