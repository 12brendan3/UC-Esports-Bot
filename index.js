const readline = require('readline');

const bot = require('./bot/bot.js');
const botStorage = require('./bot/helpers/settings-manager');
const botModules = require('./bot/helpers/module-manager');

const input = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const help =
'\n---- Here are all the commands ----\n' +
'help; This command.\n' +
'reload <item>; Reloads the specified item.  Items: settings, auth, commands, all\n' +
'reload command <command name>; Reloads a single bot command.\n' +
'restart; Restarts the entire bot.\n' +
'exit; Exits gracefully.';

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
    case 'help':
      console.info(help);
      break;
    default:
      console.info('Invalid command. Try "help" for help.');
      break;
  }
}

// Start everything
function startUp() {
  input.on('line', (line) => {
    handleUserInput(line);
  });

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
      case 'commands':
        botModules.reloadCommands();
        break;
      case 'command':
        botModules.reloadCommand(split[2]);
        break;
      case 'all':
        botStorage.loadSettings();
        botStorage.loadAuth();
        botModules.reloadCommands();
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
