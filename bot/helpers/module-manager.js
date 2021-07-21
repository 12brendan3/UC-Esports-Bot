const fs = require(`fs`);
const path = require(`path`);

let eventImports = new Map();
let commandImports = new Map();
let secretCommands = new Set();

// Exports
module.exports = {registerAll, getCommands, reloadCommands, clearAll, reloadCommand, getSecretCommands};

// Exported functions
function registerAll(client) {
  loadCommands();
  registerEvents(client);
}

function getCommands() {
  return commandImports;
}

function reloadCommands() {
  for (const command of commandImports.keys()) {
    delete require.cache[require.resolve(`../commands/${command}.js`)];
  }

  commandImports = new Map();
  secretCommands = new Set();

  console.log(`Unloaded commands...`);

  loadCommands();
}

function clearAll() {
  for (const command of commandImports.keys()) {
    delete require.cache[require.resolve(`../commands/${command}.js`)];
  }

  for (const event of eventImports.keys()) {
    delete require.cache[require.resolve(`../events/${event}.js`)];
  }

  eventImports = new Map();
  commandImports = new Map();
  secretCommands = new Set();
}

function reloadCommand(command) {
  const commands = fs.readdirSync(`./bot/commands`);

  if (commands.includes(`${command}.js`)) {
    delete require.cache[require.resolve(`../commands/${command}.js`)];
    commandImports.delete(command);
    if (secretCommands.has(command)) {
      secretCommands = secretCommands.delete(command);
    }

    commandImports.set(command, require(`../commands/${command}.js`));
    if (commandImports.get(command).getHelp() && commandImports.get(command).getHelp().level === `secret`) {
      secretCommands.add(command);
    }

    console.info(`Reloaded command: ${command}`);
  } else {
    console.info(`No command found for: ${command}`);
  }
}

function getSecretCommands() {
  return secretCommands;
}

// Private functions
function registerEvents(client) {
  const events = fs.readdirSync(`./bot/events`);

  for (let i = 0; i < events.length; i++) {
    const eventName = path.basename(events[i], `.js`);

    eventImports.set(eventName, require(`../events/${events[i]}`));

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

    eventImports.get(eventName).handle(client, eventData, eventData2);
  });
}

function loadCommands() {
  const commands = fs.readdirSync(`./bot/commands`);

  for (let i = 0; i < commands.length; i++) {
    const commandName = path.basename(commands[i], `.js`);

    commandImports.set(commandName, require(`../commands/${commands[i]}`));

    if (commandImports.get(commandName).getHelp() && commandImports.get(commandName).getHelp().level === `secret`) {
      secretCommands.add(commandName);
    }

    console.info(`Loaded command: ${commandName}`);
  }
}
