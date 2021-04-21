const settings = require(`../helpers/settings-manager`);
const ytdl = require('ytdl-core');

// Exports
module.exports = {checkUser, checkChannel};

// Regex
const regexYT = RegExp(`(^(https?\\:\\/\\/)?(www\\.youtube\\.com|youtu\\.be)\\/(watch\\?v=.{11}|.{11})$)|(^.{11}$)`);

// Vars
const players = new Map();

function checkUser(msg, type) {
  if (msg.guild === null) {
    msg.reply(`this command only works in a server.`);
    return;
  }

  if (!msg.member.voice.channel) {
    msg.reply(`you need to be connected to a voice channel.`);
    return;
  }

  const player = players.get(msg.guild.id);

  if (player && player.voiceChannel.id !== msg.member.voice.channel.id) {
    msg.reply(`you need to be connected to the active voice channel.`);
    return;
  }

  if (!player && type !== `play`) {
    msg.reply(`there is no active queue.`);
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
      msg.reply(`failed to fetch video information.  Please make sure the video URL/ID is valid and public.`);
    }
  } else {
    msg.reply(`please use a valid YouTube URL or ID.`);
  }
}

function pause(msg) {
  const player = players.get(msg.guild.id);
  player.connection.dispatcher.pause(true);
  msg.reply(`audio has been paused.`);
}

function resume(msg) {
  const player = players.get(msg.guild.id);
  player.connection.dispatcher.resume();
  msg.reply(`audio has been resumed.`);
}

function skip(guildID) {
  const player = players.get(guildID);
  player.connection.dispatcher.end();
}

function changeVolume(msg) {
  if (msg.content.length < settings.getSettings().prefix.length + 7) {
    msg.reply(`please include the new volume on a scale of 1 to 100.`);
    return;
  }

  const volume = parseFloat(msg.content.substr(settings.getSettings().prefix.length + 7)) / 100;

  if (isNaN(volume)) {
    msg.reply(`that's not a number...`);
  } else {
    const player = players.get(msg.guild.id);
    player.volume = volume;
    player.connection.dispatcher.setVolumeLogarithmic(volume);
    msg.reply(`changed the volume to ${volume * 100}%.`);
  }
}

async function addToQueue(msg, newItem) {
  const player = players.get(msg.guild.id);
  if (player) {
    player.queue.push(newItem);
    msg.reply(`added to queue.`);
  } else {
    const connection = await msg.member.voice.channel.join();
    players.set(msg.guild.id, {textChannel: msg.channel, voiceChannel: msg.member.voice.channel, queue: [newItem], volume: 0.35, connection, paused: false});
    playNext(msg.guild.id);
  }
}

function playNext(guildID) {
  const player = players.get(guildID);

  if (player.queue.length > 0) {
    const dispatcher = player.connection.play(ytdl(player.queue[0].url, {quality: `highestaudio`, highWaterMark: 128}), {plp: 1, fec: true, bitrate: `auto`, highWaterMark: 2}).on(`finish`, () => {
      player.queue.shift();
      playNext(guildID);
    }).on("error", (err) => {
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

function checkChannel(newState) {
  const player = players.get(newState.guild.id);
  if (player && player.voiceChannel.id === newState.channel.id && newState.channel.members.size < 2) {
    player.textChannel.send(`Everyone left voice chat, disconnecting.`);
    player.connection.disconnect();
    players.delete(newState.guild.id);
  }
}
