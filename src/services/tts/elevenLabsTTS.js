// Update the config.json 'use' field to 'elevenLabs' to use this.
// This class builds and describes the ElevenLabs TTS service for rendering speech (with the details in config.json).
// It is the target of the 'say' action.
// Discord TTS uses a system voice, and has some limits (200 characters of text) - which is handled with splitting.
// Roobee is best experienced with a hosted service for a more immersive response.

const ElevenLabs = require("elevenlabs-node");
const { createAudioResource, StreamType } = require("@discordjs/voice");

class ElevenLabsSpeechService {
    constructor(config){
        if (ElevenLabsSpeechService.instance) {
            return ElevenLabsSpeechService.instance;
        };
        console.info('Selecting ElevenLabs Speech Service...');
        this.voiceEngine = new ElevenLabs(config.voiceEngine.elevenLabs);
        ElevenLabsSpeechService.instance = this;
        return this;
    }

    // Takes in the Text to render as speech, subscribes the audioplayer to the voice channel
    // Streams the result into the channnel (the ElevenLabs response is the audio stream)
    renderSpeechToChannel(text, voiceChannel, audioPlayer){
        console.time("TTS Service Response Time: ");
        this.voiceEngine.textToSpeechStream({
            // The text you wish to convert to speech
            textInput: text,                
            }).then((res) => {
            let audioResource = createAudioResource(res, { inputType: StreamType.Arbitrary });
            voiceChannel.subscribe(audioPlayer);
            audioPlayer.play(audioResource);
            console.timeEnd("TTS Service Response Time: ");
        }).catch(console.error);
    };
};

// Initialize the singleton instance
ElevenLabsSpeechService.instance = null;

module.exports = ElevenLabsSpeechService;