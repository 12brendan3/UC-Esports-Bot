const fs = require('fs');
const path = require('path');

const Discord = require('discord.js');

const client = new Discord.Client();

const eventImports = {};

// Temp import bot auth
const auth = require('../storage/auth.json');

// Exported functions
module.exports = {startBot, stopBot};

function startBot() {
  registerEvents();

  client.login(auth.token);
}

function stopBot() {
  client.destroy();
}


// Private functions
function registerEvents() {
  const events = fs.readdirSync('./bot/events');
  console.log(events);

  for (let i = 0; i < events.length; i++) {
    const eventName = path.basename(events[i], '.js');

    eventImports[eventName] = require(`./events/${events[i]}`);

    client.on(eventName, (eventData, eventData2) => {
      eventImports[eventName].handle(client, eventData, eventData2);
    });

    console.info(`Loaded event: ${eventName}`);
  }
}
