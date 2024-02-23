// This class should handle all discord events/actions

const { Client, GatewayIntentBits, Events } = require("discord.js");

class DiscordService {
    constructor(config){
        console.info('Starting Discord Service...');
        this.config = config;
        // Create client
        this.client = new Client({
            intents: [
                GatewayIntentBits.GuildVoiceStates,
                GatewayIntentBits.GuildMessages,
                GatewayIntentBits.Guilds,
                GatewayIntentBits.MessageContent,
            ],
        });

        this.voiceConnection = null;
        console.info('Logging into discord...')
        this.client.login(config.discord.botKey);
        return this;
    };
};

module.exports = DiscordService;