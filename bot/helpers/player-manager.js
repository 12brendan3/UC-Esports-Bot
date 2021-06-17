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

function checkUser(interaction, type) {
  if (interaction.guild === null) {
    interaction.reply({content: `This command only works in a server.`, ephemeral: true});
    return;
  }

  if (!interaction.member.voice.channel) {
    interaction.reply({content: `You need to be connected to a voice channel.`, ephemeral: true});
    return;
  }

  const player = players.get(interaction.guild.id);

  if (player && player.voiceChannel.id !== interaction.member.voice.channel.id) {
    interaction.reply({content: `You need to be connected to the active voice channel.`, ephemeral: true});
    return;
  }

  if (!player && type !== `play`) {
    interaction.reply({content: `There is no active queue.`, ephemeral: true});
    return;
  }

  switch (type) {
    case `play`:
      play(interaction);
      break;
    case `pause`:
      pause(interaction);
      break;
    case `skip`:
      skip(interaction.guild.id);
      break;
    case `volume`:
      changeVolume(interaction);
      break;
    case `leave`:
      stopPlaying(interaction.guild.id);
      break;
    default:
      console.error(`If you're seeing this, you incorrectly interacted with the music manager.`);
      break;
  }
}

function play(interaction) {
  if (interaction.options.has(`ytsearch`)) {
    checkYT(interaction);
  } else {
    resume(interaction);
  }
}

async function checkYT(interaction) {
  const video = interaction.options.get(`ytsearch`).value;
  if (regexYT.test(video)) {
    try {
      const videoInfo = await ytdl.getInfo(video);
      const newItem = {
        type: `youtube`,
        title: videoInfo.videoDetails.title,
        url: videoInfo.videoDetails.video_url,
      };
      addToQueue(interaction, newItem);
    } catch {
      interaction.reply(`Failed to fetch video information.  Please make sure the video URL/ID is valid and public.`);
    }
  } else {
    searchYT(interaction, video);
  }
}

function pause(interaction) {
  const player = players.get(interaction.guildID);
  player.connection.dispatcher.pause(true);
  interaction.reply(`Audio has been paused.`);
}

function resume(interaction) {
  const player = players.get(interaction.guildID);
  player.connection.dispatcher.resume();
  interaction.reply(`Audio has been resumed.`);
}

function skip(guildID) {
  const player = players.get(guildID);
  player.connection.dispatcher.end();
}

function changeVolume(interaction) {
  const volume = parseInt(interaction.options.get(`volume`).value);
  const player = players.get(interaction.guildID);
  player.volume = volume / 100;
  player.connection.dispatcher.setVolumeLogarithmic(volume);
  interaction.reply(`Changed the volume to ${volume}%.`);
}

async function addToQueue(interaction, newItem) {
  const player = players.get(interaction.guildID);
  if (player) {
    player.queue.push(newItem);
    interaction.reply(`Added to queue.`);
  } else {
    const connection = await interaction.member.voice.channel.join();
    players.set(interaction.guildID, {textChannel: interaction.channel, voiceChannel: interaction.member.voice.channel, queue: [newItem], volume: 0.35, connection, paused: false});
    playNext(interaction.guildID);
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

function searchYT(interaction, search) {
  if (ytSearchOpts.key) {
    ytsearch(search, ytSearchOpts, (err, results) => {
      if (err) {
        interaction.reply(`Failed to search YouTube.`);
        console.error(err);
      } else {
        const newItem = {
          type: `youtube`,
          title: results[0].title,
          url: results[0].id,
        };
        addToQueue(interaction, newItem);
      }
    });
  } else {
    interaction.reply(`YouTube search is currently disabled.`);
  }
}
