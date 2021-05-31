const fs = require(`fs`);

const authTemplate = {botToken: `replace me`, weatherToken: `replace me`, ytKey: `replace me`, gmailUN: `replace me`, gmailPW: `replace me`};
const settingsTemplate = {prefix: `bc!`, weatherLatitude: 39.132920, weatherLongitude: -84.514952};
const version = `v1.0.5`;

let auth = {};
let settings = {};

// Exports
module.exports = {loadAll, loadAuth, loadSettings, getAuth, getSettings, clearAll, version};

// Exported functions
function loadAll() {
  loadAuth();
  loadSettings();
}

function loadAuth() {
  if (fs.existsSync(`./storage`) && fs.existsSync(`./storage/auth.json`)) {
    try {
      auth = JSON.parse(fs.readFileSync(`./storage/auth.json`));
      console.info(`Auth loaded.`);
    } catch {
      console.info(`Your auth file is malformed.`);
    }
  } else {
    console.info(`No auth file found, making one.`);

    if (!fs.existsSync(`./storage`)) {
      fs.mkdirSync(`./storage`);
    }

    fs.writeFileSync(`./storage/auth.json`, JSON.stringify(authTemplate, null, 2));
  }
}

function loadSettings() {
  if (fs.existsSync(`./storage/settings.json`)) {
    try {
      settings = JSON.parse(fs.readFileSync(`./storage/settings.json`));
      console.info(`Settings loaded.`);
    } catch {
      console.info(`Your settings file is malformed.`);
    }
  } else {
    console.info(`No settings file found, making one.`);

    if (!fs.existsSync(`./storage`)) {
      fs.mkdirSync(`./storage`);
    }

    fs.writeFileSync(`./storage/settings.json`, JSON.stringify(settingsTemplate, null, 2));
  }

  if (!fs.existsSync(`./storage/task-files`)) {
    fs.mkdirSync(`./storage/task-files`);
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
