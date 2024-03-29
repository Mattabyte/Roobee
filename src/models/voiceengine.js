// The class that controls all generated voice (including selecting and referring to your Speech service)
// This consumes the voiceEngine section in config.json to refer and configure the correct TTS service

class VoiceEngine {
    constructor(config){
        if (VoiceEngine.instance) {
            return VoiceEngine.instance;
        };
        console.info('Starting Voice Engine...')
        this.service = this.configureService(config);
        VoiceEngine.instance = this;
        return this;
    };

    configureService(config){
        // Determine service provider from config
        let serviceProvider = null;
        switch(config.voiceEngine.use) {
            case 'azure':
              // Use Azure Speech
              const AzureSpeechService = require('@tts/azureTTS');
              serviceProvider = new AzureSpeechService(config);
              break;
            case 'elevenLabs':
              // Use ElevenLabs.io
              const ElevenLabsSpeechService = require('@tts/ElevenLabsTTS');
              serviceProvider = new ElevenLabsSpeechService(config);
              break;
            default:
              const DiscordTTSService = require('@tts/DiscordTTS');
              serviceProvider = new DiscordTTSService(config);
        };

        if (serviceProvider){
            return serviceProvider;
        } else {
            throw new Error(`Failed to load Speech Service: ${err.message}`);
        };
    };

    say(text, voiceChannel, audioPlayer){
        this.service.renderSpeechToChannel(text, voiceChannel, audioPlayer);
    };
};

// Initialize the singleton instance
VoiceEngine.instance = null;

module.exports = VoiceEngine;