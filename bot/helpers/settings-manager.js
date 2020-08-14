const fs = require('fs');

const authTemplate = {botToken: 'replace me'};
const settingsTemplate = {prefix: 'bc!'};

let auth = {};
let settings = {};

// Exports
module.exports = {loadAll, loadAuth, loadSettings, getAuth, getSettings, clearAll};

// Exported functions
function loadAll() {
  loadAuth();
  loadSettings();
}

// Private functions
function loadAuth() {
  if (fs.existsSync('./storage') && fs.existsSync('./storage/auth.json')) {
    try {
      auth = JSON.parse(fs.readFileSync('./storage/auth.json'));
      console.info('Auth loaded.');
    } catch {
      console.info('Your auth file is malformed.');
    }
  } else {
    console.info('No auth file found, making one.');

    if (!fs.existsSync('./storage')) {
      fs.mkdirSync('./storage');
    }

    fs.writeFileSync('./storage/auth.json', JSON.stringify(authTemplate, null, 2));
  }
}

function loadSettings() {
  if (fs.existsSync('./storage/settings.json')) {
    try {
      settings = JSON.parse(fs.readFileSync('./storage/settings.json'));
      console.info('Settings loaded.');
    } catch {
      console.info('Your settings file is malformed.');
    }
  } else {
    console.info('No settings file found, making one.');

    if (!fs.existsSync('./storage')) {
      fs.mkdirSync('./storage');
    }

    fs.writeFileSync('./storage/settings.json', JSON.stringify(settingsTemplate, null, 2));
  }
}

function getSettings() {
  return settings;
}

function getAuth() {
  return auth;
}

function clearAll() {
  auth = {};
  settings = {};
}
