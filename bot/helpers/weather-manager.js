const axios = require(`axios`);
const settings = require(`./settings-manager`);

let lastCheck = 0;

// eslint-disable-next-line babel/camelcase
let currentData = {temp: {value: `...`}, weather_code: {value: `unknown`}};

// Exports
module.exports = {setBotStatus, getWeather};

// Exported functions
function getWeather() {
  return currentData;
}

async function setBotStatus(client) {
  if (settings.getAuth().weatherToken || settings.getAuth().weatherToken === `replace me`) {
    await getWeatherData();
    const status = `for ${settings.getSettings().prefix}help | ${getEmoji(currentData.weather_code.value)} ${Math.round(currentData.temp.value)}°F`;
    client.user.setPresence({activity: {name: status, type: `WATCHING`}});

    setTimeout(() => {
      setBotStatus(client);
    }, 600000);
  } else {
    console.error(`No weather token found, please edit the "settings.json" file in the storage folder.\nYou can then type "restart" and then press enter.\nTo exit, type "exit" and then press enter.`);
  }
}

// Private functions
async function getWeatherData() {
  const currentTime = Date.now();

  if (currentTime >= lastCheck + 600000) {
    lastCheck = currentTime;

    // lat/lon is somewhere on UC's campus towards the middle
    const params = {
      lat: `39.1329`,
      lon: `-84.5150`,
      // eslint-disable-next-line babel/camelcase
      unit_system: `us`,
      fields: `temp,weather_code,sunrise,sunset,moon_phase`,
      apikey: settings.getAuth().weatherToken,
    };

    try {
      const newData = await axios.get(`https://api.climacell.co/v3/weather/realtime`, {params});

      const sunrise = new Date(newData.data.sunrise.value).getTime();
      const sunset = new Date(newData.data.sunset.value).getTime();

      if (sunrise > currentTime || sunset < currentTime) {
        newData.data.weather_code.value = newData.data.moon_phase.value;
      }

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
    case `new`:
      return `🌑`;
    case `waxing_crescent`:
      return `🌒`;
    case `first_quarter`:
      return `🌓`;
    case `waxing_gibbous`:
      return `🌔`;
    case `full`:
      return `🌕`;
    case `waning_gibbous`:
      return `🌖`;
    case `last_quarter`:
      return `🌗`;
    case `waning_crescent`:
      return `🌘`;
    default:
      return `❔`;
  }
}
