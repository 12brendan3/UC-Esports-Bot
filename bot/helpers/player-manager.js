const settings = require(`../helpers/settings-manager`);
const YTDlpWrap = require('yt-dlp-wrap').default;
const ytsearch = require(`youtube-search`);
const voice = require(`@discordjs/voice`);
const replyHelper = require(`./interaction-helper`);
const htmlEntities = require(`html-entities`);

const ytdlp = new YTDlpWrap();

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
    replyHelper.interactionReply(interaction, {content: `This command only works in a server.`, ephemeral: true});
    return;
  }

  if (!interaction.member.voice.channel) {
    replyHelper.interactionReply(interaction, {content: `You need to be connected to a voice channel.`, ephemeral: true});
    return;
  }

  if (!players.has(interaction.guildId) && (type !== `play` || !interaction.options.get(`ytsearch`))) {
    replyHelper.interactionReply(interaction, {content: `There is no active queue.`, ephemeral: true});
    return;
  }

  const player = players.get(interaction.guildId);

  if (player && player.voiceChannel.id !== interaction.member.voice.channel.id) {
    replyHelper.interactionReply(interaction, {content: `You need to be connected to the active voice channel.`, ephemeral: true});
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
      replyHelper.interactionReply(interaction, {content: `Disconnected and cleared the queue.`});
      break;
    default:
      console.error(`If you're seeing this, you incorrectly interacted with the music manager.`);
      break;
  }
}

function play(interaction) {
  if (interaction.options.get(`ytsearch`)) {
    checkYT(interaction);
  } else {
    resume(interaction);
  }
}

async function checkYT(interaction) {
  await interaction.deferReply();
  const video = interaction.options.get(`ytsearch`).value;
  if (regexYT.test(video)) {
    try {
      const videoInfo = await ytdlp.getVideoInfo(video);
      const newItem = {
        type: `youtube`,
        title: videoInfo.title,
        url: `https://youtu.be/${videoInfo.id}`,
      };
      addToQueue(interaction, newItem);
    } catch {
      replyHelper.interactionEdit(interaction, {content: `Failed to fetch video information.  Please make sure the video URL/ID is valid and public.`});
    }
  } else {
    searchYT(interaction, video);
  }
}

function pause(interaction) {
  const player = players.get(interaction.guildId);
  if (player.audioPlayer.state.status !== `paused`) {
    player.audioPlayer.pause();
    replyHelper.interactionReply(interaction, {content: `Audio has been paused.`});
  } else {
    replyHelper.interactionReply(interaction, {content: `Audio isn't currently playing.`, ephemeral: true});
  }
}

function resume(interaction) {
  const player = players.get(interaction.guildId);
  if (player.audioPlayer.state.status === `paused`) {
    player.audioPlayer.unpause();
    replyHelper.interactionReply(interaction, {content: `Audio has been resumed.`});
  } else {
    replyHelper.interactionReply(interaction, {content: `Audio isn't currently paused.`, ephemeral: true});
  }
}

function skip(interaction) {
  const player = players.get(interaction.guildId);
  player.audioPlayer.stop();
  replyHelper.interactionReply(interaction, {content: `Skipped!`});
}

function changeVolume(interaction) {
  const volume = parseInt(interaction.options.get(`volume`).value);
  const player = players.get(interaction.guildId);
  player.volume = volume / 100;
  player.resource.volume.setVolumeLogarithmic(player.volume);
  replyHelper.interactionReply(interaction, {content: `Changed the volume to ${volume}%.`});
}

async function addToQueue(interaction, newItem) {
  const player = players.get(interaction.guildId);
  if (player) {
    player.queue.push(newItem);
    replyHelper.interactionEdit(interaction, `Added to queue: ${newItem.title}`);
  } else {
    const connectionplayer = prepConnection(interaction);
    players.set(interaction.guildId, {textChannel: interaction.channel, voiceChannel: interaction.member.voice.channel, queue: [`filler`, newItem], volume: 0.25, connection: connectionplayer.voiceConnection, audioPlayer: connectionplayer.audioPlayer, resource: null, killed: false});
    replyHelper.interactionEdit(interaction, `Connected to voice.`);
    playNext(interaction.guildId);
  }
}

function playNext(guildID) {
  const player = players.get(guildID);
  player.queue.shift();

  if (player.queue.length > 0) {
    const resource = voice.createAudioResource(ytdlp.execStream([ player.queue[0].url, '-f', 'bestaudio' ]), {
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
  if (player) {
    if (!player.killed) {
      player.killed = true;
      player.audioPlayer.stop(true);
      player.connection.destroy();
    }
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
        replyHelper.interactionReply(interaction, {content: `Failed to search YouTube.`});
        console.error(err);
      } else {
        const newItem = {
          type: `youtube`,
          title: htmlEntities.decode(results[0].title),
          url: results[0].id,
        };
        addToQueue(interaction, newItem);
      }
    });
  } else {
    replyHelper.interactionReply(interaction, {content: `YouTube search is currently disabled.`});
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