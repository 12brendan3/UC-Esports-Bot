const axios = require(`axios`);
const settings = require(`./settings-manager`);
const Discord = require(`discord.js`);

let lastCheck = 0;

let currentData = {temperature: `...`, weatherCode: `unknown`};

// Exports
module.exports = {setBotStatus, getWeather};

// Exported functions
function getWeather() {
  return currentData;
}

async function setBotStatus(client) {
  let status;

  if (settings.getAuth().weatherToken && settings.getAuth().weatherToken != `replace me`) {
    await getWeatherData();
    status = `the sky | ${getEmoji(currentData.weatherCode)} ${Math.round(currentData.temperature)}°F`;

    setTimeout(() => {
      setBotStatus(client);
    }, 600000);
  } else {
    console.error(`No weather token found, please edit the "auth.json" file in the storage folder.\nYou can then type "restart" and then press enter.\nTo exit, type "exit" and then press enter.`);
    status = `the sky`;
  }

  client.user.setPresence({status: 'online', afk: false, activities: [{ name: status, type: Discord.ActivityType.Watching }]});
}

// Private functions
async function getWeatherData() {
  const currentTime = Date.now();

  if (currentTime >= lastCheck + 600000) {
    lastCheck = currentTime;

    // Eventually re-add sunriseTime,sunsetTime,moonPhase
    const params = {
      location: `${settings.getSettings().weatherLatitude},${settings.getSettings().weatherLongitude}`,
      units: `imperial`,
      fields: `temperature,weatherCode`,
      timesteps: `current`,
      apikey: settings.getAuth().weatherToken,
    };

    try {
      const newData = await axios.get(`https://api.tomorrow.io/v4/timelines`, {params});

      /* Disable sunrise/sunset and moon phase for now
      const sunrise = new Date(newData.data.sunrise.value).getTime();
      const sunset = new Date(newData.data.sunset.value).getTime();

      if (sunrise > currentTime || sunset < currentTime) {
        newData.data.weather_code.value = newData.data.moon_phase.value;
      } */

      currentData = newData.data.data.timelines[0].intervals[0].values;
    } catch (err) {
      console.error(`There was an error fetching the weather data...`);
      console.error(err);
    }
  }
}

function getEmoji(value) {
  switch (value) {
    case 6201:
    case 6001:
    case 6200:
    case 6000:
      return `🥶`;
    case 7101:
    case 7000:
    case 7102:
      return `🧊`;
    case 5101:
      return `❄️`;
    case 5000:
    case 5100:
      return `🌨️`;
    case 5001:
      return `🌬️`;
    case 8000:
      return `⛈️`;
    case 4000:
      return `🌂`;
    case 4200:
      return `☔`;
    case 4001:
      return `🌧️`;
    case 4201:
      return `⛆`;
    case 2100:
    case 2000:
      return `🌁`;
    case 1001:
      return `☁️`;
    case 1102:
      return `🌥️`;
    case 1101:
      return `⛅`;
    case 1100:
      return `🌤️`;
    case 1000:
      return `☀️`;
    case 3000:
      return `🎐`;
    case 3001:
      return `🍃`;
    case 3002:
      return `💨`;
    case 0:
      return `🌑`;
    case 1:
      return `🌒`;
    case 2:
      return `🌓`;
    case 3:
      return `🌔`;
    case 4:
      return `🌕`;
    case 5:
      return `🌖`;
    case 6:
      return `🌗`;
    case 7:
      return `🌘`;
    default:
      return `❔`;
  }
}
