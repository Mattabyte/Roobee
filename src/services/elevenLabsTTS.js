// Update the config.json 'use' field to 'elevenLabs' to use this.
// This class builds and describes the ElevenLabs TTS service for rendering speech (with the details in config.json).
// It is the target of the 'say' action.
// Discord TTS uses a system voice, and has some limits (200 characters of text) - which is handled with splitting.
// Roobee is best experienced with a hosted service for a more immersive response.

const ElevenLabs = require("elevenlabs-node");

class ElevenLabsSpeechService {
    constructor(config){
        console.info('Selecting ElevenLabs Speech Service...');
        const voiceEngine = new ElevenLabs(config.voiceEngine.elevenLabs);
    };
};

module.exports = ElevenLabsSpeechService;