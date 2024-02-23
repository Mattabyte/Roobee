// Update the config.json 'use' field to 'default' to use this (or leave it empty).
// This class builds and describes the Discord TTS service for rendering speech (If the bot owner does not wish to use a hosted/paid service).
// It is the target of the 'say' action.
// Discord TTS uses a system voice, and has some limits (200 characters of text) - which is handled with splitting.
// Roobee is best experienced with a hosted service for a more immersive response.

const discordTTS = require('discord-tts');

class DiscordTTSService {
    constructor(config){
        console.info('Selecting Discord TTS Speech Service...');
    };
};

module.exports = DiscordTTSService;