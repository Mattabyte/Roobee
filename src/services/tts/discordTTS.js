// Update the config.json 'use' field to 'default' to use this (or leave it empty).
// This class builds and describes the Discord TTS service for rendering speech (If the bot owner does not wish to use a hosted/paid service).
// It is the target of the 'say' action.
// Discord TTS uses a system voice, and has some limits (200 characters of text) - which is handled with splitting.
// Roobee is best experienced with a hosted service for a more immersive response.

const discordTTS = require('discord-tts');
const { createAudioResource, StreamType } = require("@discordjs/voice");

class DiscordTTSService {
    constructor(config){
        console.info('Selecting Discord TTS Speech Service...');
    };

    // Takes in the Text to render as speech, subscribes the audioplayer to the voice channel
    // Streams the result into the channnel
    renderSpeechToChannel(text, voiceChannel, audioPlayer){
        console.time("TTS Service Response Time: ");
        // Max characters of the TTS service is 200, so have to split the response
        if (text.length > 200){
            // 200 characters is max for discordTTS. Split message.
            console.log('Text is long. Splitting.');
            let regex = /.{1,200}(?=[.!?,]\s+|$)|\S+?$/g;
            let longtext = text.match(regex);
            // TODO: Odd behvaiours when queueing responses - need to test/fix later.
            // For now, just speak first 200 characters of the response.
            let stream=discordTTS.getVoiceStream(longtext[0]);
            let audioResource=createAudioResource(stream, {inputType: StreamType.Arbitrary, inlineVolume:true});
            voiceChannel.subscribe(audioPlayer);
            audioPlayer.play(audioResource);
        } else {
            console.log(text);
            let stream=discordTTS.getVoiceStream(text);
            let audioResource=createAudioResource(stream, {inputType: StreamType.Arbitrary, inlineVolume:true});
            voiceChannel.subscribe(audioPlayer);
            audioPlayer.play(audioResource);
        }
        console.timeEnd("TTS Service Response Time: ");
    };
};

module.exports = DiscordTTSService;