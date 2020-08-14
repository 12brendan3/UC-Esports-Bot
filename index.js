const readline = require('readline');

const bot = require('./bot/bot.js');
const botStorage = require('./bot/helpers/settings-manager');

const input = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Allow user input
input.on('line', (line) => {
  handleUserInput(line);
});

// Do something with user input
function handleUserInput(line) {
  let check = line;
  const split = line.split(' ');

  if (line.includes(' ')) {
    check = split[0];
  }

  switch (check) {
    case 'restart':
      bot.restartBot();
      break;
    case 'exit':
      exit();
      break;
    case 'reload':
      reloadSomething(split);
      break;
    default:
      console.info('Invalid command.');
      break;
  }
}

// Start everything
function startUp() {
  bot.startBot();
}

// Quit everything and exit
function exit() {
  input.close();
  bot.stopBot();
  process.exit();
}

// Reload something specified by the user
function reloadSomething(split) {
  if (split[1]) {
    switch (split[1]) {
      case 'settings':
        botStorage.loadSettings();
        break;
      case 'auth':
        botStorage.loadAuth();
        break;
      default:
        console.info('Invalid reload option.');
        break;
    }
  } else {
    console.info('Please include what you want to reload.');
  }
}

// Kick it all off
startUp();
