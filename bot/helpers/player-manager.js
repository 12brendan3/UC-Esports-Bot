const settings = require(`../helpers/settings-manager`);
const ytdl = require(`ytdl-core`);
const ytsearch = require(`youtube-search`);

// Exports
module.exports = {checkUser, checkChannel, prepKey};

// Regex
const regexYT = RegExp(`(^(https?\\:\\/\\/)?(www\\.youtube\\.com|youtu\\.be)\\/(watch\\?v=.{11}|.{11})$)|(^.{11}$)`);

// Vars
const players = new Map();
const ytSearchOpts = {
  maxResults: 1,
  key: null,
};

function prepKey() {
  const newKey = settings.getAuth().ytKey;
  if (newKey && newKey !== `replace me`) {
    ytSearchOpts.key = newKey;
  } else {
    console.error(`No YouTube key found, please edit the "auth.json" file in the storage folder.\nYou can then type "restart" and then press enter.\nTo exit, type "exit" and then press enter.`);
  }

  console.info(`YouTube API key set.`);
}

function checkUser(msg, type) {
  if (msg.guild === null) {
    msg.reply(`This command only works in a server.`);
    return;
  }

  if (!msg.member.voice.channel) {
    msg.reply(`You need to be connected to a voice channel.`);
    return;
  }

  const player = players.get(msg.guild.id);

  if (player && player.voiceChannel.id !== msg.member.voice.channel.id) {
    msg.reply(`You need to be connected to the active voice channel.`);
    return;
  }

  if (!player && type !== `play`) {
    msg.reply(`There is no active queue.`);
    return;
  }

  switch (type) {
    case `play`:
      play(msg);
      break;
    case `pause`:
      pause(msg);
      break;
    case `skip`:
      skip(msg.guild.id);
      break;
    case `volume`:
      changeVolume(msg);
      break;
    case `leave`:
      stopPlaying(msg.guild.id);
      break;
    default:
      console.error(`If you're seeing this, you incorrectly interacted with the music manager.`);
      break;
  }
}

function play(msg) {
  if (msg.content.length > settings.getSettings().prefix.length + 4) {
    checkYT(msg);
  } else {
    resume(msg);
  }
}

async function checkYT(msg) {
  const video = msg.content.substr(settings.getSettings().prefix.length + 5);
  if (regexYT.test(video)) {
    try {
      const videoInfo = await ytdl.getInfo(video);
      const newItem = {
        type: `youtube`,
        title: videoInfo.videoDetails.title,
        url: videoInfo.videoDetails.video_url,
      };
      addToQueue(msg, newItem);
    } catch {
      msg.reply(`Failed to fetch video information.  Please make sure the video URL/ID is valid and public.`);
    }
  } else {
    searchYT(msg, video);
  }
}

function pause(msg) {
  const player = players.get(msg.guild.id);
  player.connection.dispatcher.pause(true);
  msg.reply(`Audio has been paused.`);
}

function resume(msg) {
  const player = players.get(msg.guild.id);
  player.connection.dispatcher.resume();
  msg.reply(`Audio has been resumed.`);
}

function skip(guildID) {
  const player = players.get(guildID);
  player.connection.dispatcher.end();
}

function changeVolume(msg) {
  if (msg.content.length < settings.getSettings().prefix.length + 7) {
    msg.reply(`Please include the new volume on a scale of 1 to 100.`);
    return;
  }

  const volume = parseFloat(msg.content.substr(settings.getSettings().prefix.length + 7)) / 100;

  if (isNaN(volume)) {
    msg.reply(`That's not a number...`);
  } else {
    const player = players.get(msg.guild.id);
    player.volume = volume;
    player.connection.dispatcher.setVolumeLogarithmic(volume);
    msg.reply(`Changed the volume to ${volume * 100}%.`);
  }
}

async function addToQueue(msg, newItem) {
  const player = players.get(msg.guild.id);
  if (player) {
    player.queue.push(newItem);
    msg.reply(`Added to queue.`);
  } else {
    const connection = await msg.member.voice.channel.join();
    players.set(msg.guild.id, {textChannel: msg.channel, voiceChannel: msg.member.voice.channel, queue: [newItem], volume: 0.35, connection, paused: false});
    playNext(msg.guild.id);
  }
}

function playNext(guildID) {
  const player = players.get(guildID);

  if (player.queue.length > 0) {
    const dispatcher = player.connection.play(ytdl(player.queue[0].url, {quality: `highestaudio`, highWaterMark: 1}), {bitrate: `auto`, highWaterMark: 1}).on(`finish`, () => {
      player.queue.shift();
      playNext(guildID);
    }).on(`error`, (err) => {
      console.error(err);
    });

    dispatcher.setVolumeLogarithmic(player.volume);
    player.textChannel.send(`Now playing ${player.queue[0].title}.`);
  } else {
    player.textChannel.send(`End of queue, disconnecting.`);
    player.connection.disconnect();
    players.delete(guildID);
  }
}

function stopPlaying(guildID) {
  const player = players.get(guildID);
  player.connection.disconnect();
  players.delete(guildID);
}

function checkChannel(newState) {
  const player = players.get(newState.guild.id);
  if (player && player.voiceChannel.id === newState.channel.id && newState.channel.members.size < 2) {
    player.textChannel.send(`Everyone left voice chat, disconnecting.`);
    stopPlaying(newState.guild.id);
  }
}

function searchYT(msg, search) {
  if (ytSearchOpts.key) {
    ytsearch(search, ytSearchOpts, (err, results) => {
      if (err) {
        msg.reply(`Failed to search YouTube.`);
        console.error(err);
      } else {
        const newItem = {
          type: `youtube`,
          title: results[0].title,
          url: results[0].id,
        };
        addToQueue(msg, newItem);
      }
    });
  } else {
    msg.reply(`YouTube search is currently disabled.`);
  }
}
