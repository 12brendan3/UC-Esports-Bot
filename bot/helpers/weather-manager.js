const axios = require(`axios`);
const settings = require(`./settings-manager`);

let lastCheck = 0;

// eslint-disable-next-line babel/camelcase
let currentData = {temp: {value: `....`}, weather_code: {value: `unknown`}};

// Exports
module.exports = {startStatusLoop, getWeather};

// Exported functions
function startStatusLoop(client) {
  setBotStatus(client);
  setTimeout(() => {
    setBotStatus(client);
  }, 300000);
}

function getWeather() {
  return currentData;
}

// Private functions
async function setBotStatus(client) {
  await getWeatherData();
  const status = `for ${settings.getSettings().prefix}help | ${getEmoji(currentData.weather_code.value)} ${Math.round(currentData.temp.value)}°F`;
  client.user.setPresence({activity: {name: status, type: `WATCHING`}});
}

async function getWeatherData() {
  const currentTime = new Date().getTime();

  if (currentTime > lastCheck + 300000) {
    lastCheck = currentTime;

    const params = {
      lat: `39.131813`,
      lon: `-84.5159845`,
      // eslint-disable-next-line babel/camelcase
      unit_system: `us`,
      fields: `temp,weather_code`,
      apikey: settings.getAuth().weatherToken,
    };

    try {
      const newData = await axios.get(`https://api.climacell.co/v3/weather/realtime`, {params});
      currentData = newData.data;
    } catch (err) {
      console.error(`There was an error fetching the weather data....`);
      console.error(err);
    }
  }
}

function getEmoji(value) {
  switch (value) {
    case `freezing_rain_heavy`:
    case `freezing_rain`:
    case `freezing_rain_light`:
    case `freezing_drizzle`:
      return `🥶`;
    case `ice_pellets_heavy`:
    case `ice_pellets`:
    case `ice_pellets_light`:
      return `🧊`;
    case `snow_heavy`:
      return `❄️`;
    case `snow`:
    case `snow_light`:
      return `🌨️`;
    case `flurries`:
      return `🌬️`;
    case `tstorm`:
      return `⛈️`;
    case `rain_heavy`:
    case `rain`:
    case `rain_light`:
    case `drizzle`:
      return `🌧️`;
    case `fog_light`:
    case `fog`:
      return `🌁`;
    case `cloudy`:
      return `☁️`;
    case `mostly_cloudy`:
      return `🌥️`;
    case `partly_cloudy`:
      return `⛅`;
    case `mostly_clear`:
      return `🌤️`;
    case `clear`:
      return `☀️`;
    default:
      return `❔`;
  }
}
