const settings = require(`../helpers/settings-manager`);
const ytdl = require(`ytdl-core`);
const ytsearch = require(`youtube-search`);
const voice = require(`@discordjs/voice`);

// Exports
module.exports = {checkUser, checkChannel, prepKey};

// Regex
const regexYT = new RegExp(`(^(https?\\:\\/\\/)?(www\\.youtube\\.com|youtu\\.be)\\/(watch\\?v=.{11}|.{11})$)|(^.{11}$)`);

// Vars
const players = new Map();
const ytSearchOpts = {
  maxResults: 1,
  key: null,
  type: `video`,
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

  const player = players.get(interaction.guildId);

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
      skip(interaction);
      break;
    case `volume`:
      changeVolume(interaction);
      break;
    case `leave`:
      stopPlaying(interaction.guildId);
      interaction.reply(`Disconnected and cleared the queue.`);
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
  interaction.reply(`One moment....`);
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
  const player = players.get(interaction.guildId);
  player.audioPlayer.pause();
  interaction.reply(`Audio has been paused.`);
}

function resume(interaction) {
  const player = players.get(interaction.guildId);
  player.audioPlayer.unpause();
  interaction.reply(`Audio has been resumed.`);
}

function skip(interaction) {
  const player = players.get(interaction.guildId);
  player.audioPlayer.stop();
  interaction.reply(`Skipped!`);
}

function changeVolume(interaction) {
  const volume = parseInt(interaction.options.get(`volume`).value);
  const player = players.get(interaction.guildId);
  player.volume = volume / 100;
  player.resource.volume.setVolumeLogarithmic(player.volume);
  interaction.reply(`Changed the volume to ${volume}%.`);
}

async function addToQueue(interaction, newItem) {
  const player = players.get(interaction.guildId);
  if (player) {
    player.queue.push(newItem);
    interaction.editReply(`Added to queue: ${newItem.title}`);
  } else {
    const connectionplayer = prepConnection(interaction);
    players.set(interaction.guildId, {textChannel: interaction.channel, voiceChannel: interaction.member.voice.channel, queue: [`filler`, newItem], volume: 0.25, connection: connectionplayer.voiceConnection, audioPlayer: connectionplayer.audioPlayer, resource: null, killed: false});
    interaction.editReply(`Connected to voice.`);
    playNext(interaction.guildId);
  }
}

function playNext(guildID) {
  const player = players.get(guildID);
  player.queue.shift();

  if (player.queue.length > 0) {
    const resource = voice.createAudioResource(ytdl(player.queue[0].url, {quality: `highestaudio`, highWaterMark: 1 << 25}), {
      inputType: voice.StreamType.Arbitrary,
      inlineVolume: true,
    });
    resource.volume.setVolumeLogarithmic(player.volume);
    player.resource = resource;
    player.audioPlayer.play(resource);
    player.textChannel.send(`Now playing ${player.queue[0].title}.`);
  } else {
    if (player.killed) {
      return;
    }

    player.textChannel.send(`End of queue, disconnecting.`);
    stopPlaying(guildID);
  }
}

function stopPlaying(guildID) {
  const player = players.get(guildID);
  if (player && !player.killed) {
    player.killed = true;
    player.audioPlayer.stop(true);
    player.connection.destroy();
    players.delete(guildID);
  }
}

function checkChannel(newState) {
  const player = players.get(newState.guild.id);
  if (player && player.voiceChannel.members.size < 2) {
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

function prepConnection(interaction) {
  const voiceConnection = voice.joinVoiceChannel({channelId: interaction.member.voice.channel.id, guildId: interaction.guildId, adapterCreator: interaction.guild.voiceAdapterCreator});

  voiceConnection.on(`stateChange`, async (_, newState) => {
    if (newState.status === voice.VoiceConnectionStatus.Disconnected) {
      if (newState.reason === voice.VoiceConnectionDisconnectReason.WebSocketClose && newState.closeCode === 4014) {
        try {
          await voice.entersState(voiceConnection, voice.VoiceConnectionStatus.Connecting, 5000);
        } catch {
          stopPlaying(interaction.guildId);
        }
      } else if (voiceConnection.rejoinAttempts < 5) {
        await wait((voiceConnection.rejoinAttempts + 1) * 5000);
        voiceConnection.rejoin();
      } else {
        stopPlaying(interaction.guildId);
      }
    } else if (newState.status === voice.VoiceConnectionStatus.Destroyed) {
      stopPlaying(interaction.guildId);
    } else if (newState.status === voice.VoiceConnectionStatus.Connecting || newState.status === voice.VoiceConnectionStatus.Signalling) {
      try {
        await voice.entersState(voiceConnection, voice.VoiceConnectionStatus.Ready, 20000);
      } catch {
        if (voiceConnection.state.status !== voice.VoiceConnectionStatus.Destroyed) {
          stopPlaying(interaction.guildId);
        }
      }
    }
  });

  const audioPlayer = voice.createAudioPlayer();

  audioPlayer.on(`stateChange`, (oldState, newState) => {
    if (newState.status === voice.AudioPlayerStatus.Idle && oldState.status !== voice.AudioPlayerStatus.Idle) {
      playNext(interaction.guildId);
    }
  });

  audioPlayer.on(`error`, (error) => console.error(error));

  voiceConnection.subscribe(audioPlayer);

  return {audioPlayer, voiceConnection};
}

function wait(time) {
  return new Promise((resolve) => setTimeout(resolve, time).unref());
}