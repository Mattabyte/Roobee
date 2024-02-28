// This class should handle all discord events/actions

const { Client, GatewayIntentBits, Events } = require("discord.js");

class DiscordService {
    constructor(config){
        if (DiscordService.instance) {
            return DiscordService.instance;
        };
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
        DiscordService.instance = this;
        return this;
    };
};

// Initialize the singleton instance
DiscordService.instance = null;

module.exports = DiscordService;