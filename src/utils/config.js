// The class handles config validation to make sure everything is all set before starting Roobee
const fs = require('fs');
const path = require('path');

class Config {
    constructor(config_filepath, rootpath){
        this.config = this.load(config_filepath, rootpath);
    };

    load(config_filepath, rootpath) {
        try {
        // Load Config File
            var config_data = JSON.parse(fs.readFileSync(config_filepath, 'utf8'));
        } catch (err) {
            throw new Error(`Error loading Config File: ${config_filepath}: ${err.message}`);
        };
        // Don't return it unless it's valid
        if (this.validate(config_data, rootpath)){
            // Add the root path
            config_data.rootpath = rootpath;
            return config_data;
        } else {
            throw new Error(`Config File failed validation: ${config_filepath}`);
        };
    }

    validate(config, rootpath){
        // General Roobee Config - Name, command phrases
        if (!config.roobee || !config.roobee.names || config.roobee.names == '' || !config.roobee.quitPhrases || !config.roobee.shushPhrases ) {
            throw new Error('Invalid configuration: Roobee needs name set, and quit/quiet phrases set.');
        };

        // Discord Bot Key must be set
        if (!config.discord || !config.discord.botKey || config.discord.botKey == '') {
            throw new Error('Invalid configuration: discord.botKey must be set.');
        };

        //LLM Endpoint must be set
        if (!config.llmConfig || !config.llmConfig.endpoint || config.llmConfig.endpoint == '') {
            throw new Error('Invalid configuration: llmConfig.endpoint must be set.');
        };

        //Prompt file set and exists
        if (!config.llmConfig.systemPromptFile || !fs.existsSync(path.join(rootpath, `/config/${config.llmConfig.systemPromptFile}`), "utf8")) {
            throw new Error('Invalid configuration: systemPromptFile must be set and file exist in the config/ folder.');
        }

        // Check if voice engine is set and if it has corresponding configuration
        if (!config.voiceEngine || !config.voiceEngine.use || !config.voiceEngine[config.voiceEngine.use]) {
            throw new Error('Invalid configuration: voiceEngine.use must be set and have corresponding configuration.');
        };

        //Validate Voice Engine settings:
        switch (config.voiceEngine.use){
            case 'azure':
        //Validate Key/Settings for Azure
                if (!config.voiceEngine.azure.subkey || !config.voiceEngine.azure.region || !config.voiceEngine.azure.lang || !config.voiceEngine.azure.voice ){
                    console.error(`Configuration for Azure Voice Service failed validation. Ensure subkey, region, lang and voice properties exist.`);
                    return false;
                };
                //Try to load SSML file
                try {
                    config.voiceEngine.azure.ssmlFileContent = fs.readFileSync(path.join(rootpath, `/config/${config.voiceEngine.azure.ssmlFile}`), 'utf8')
                } catch {
                    console.error(`azureSSMLDefinition.xml File does not exist or is malformed.`);
                    return false;
                }
                // Check file for tokens
                if(!config.voiceEngine.azure.ssmlFileContent.includes('{{lang}}') || !config.voiceEngine.azure.ssmlFileContent.includes('{{voice}}') || !config.voiceEngine.azure.ssmlFileContent.includes('{{text}}')){
                    console.error(`azureSSMLDefinition.xml is missing one or more tokens. Required Tokens: {{lang}}, {{voice}} and {{text}} .`);
                    return false;
                }
                break;
            case 'elevenLabs':
        //Validate Key/Settings for ElevenLabs
                if (!(config.voiceEngine.elevenLabs.apiKey && config.voiceEngine.elevenLabs.voiceId)){
                    console.error(`Configuration for ElevenLabs Voice Service failed validation. Ensure apiKey, voiceId properties exist.`);
                    return false;
                };
            default:
        // Default Discord TTS Service
                console.log('Defaulting to Discord TTS service');
        };
        return true;
    };
};

module.exports = Config;