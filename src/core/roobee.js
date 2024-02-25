// The 'brain' of roobee. Compares information, makes decisions from input, acts on decisions.
const { addSpeechEvent, SpeechEvents } = require("discord-speech-recognition");
const { joinVoiceChannel, getVoiceConnection, createAudioPlayer } = require("@discordjs/voice");
const { Events } = require("discord.js");
const VoiceEngine = require('@models/voiceengine');
const Relationship = require('@models/relationship');
const Conversation = require('@models/conversation');
const Discord = require('@services/discordService');
const LLMService = require('@services/llmRequest');

class Roobee {
    constructor(config) {;
        this.config = config;
        // Services
        this.voiceEngine = new VoiceEngine(config);
        this.discordService = new Discord(config);
        this.llmService = new LLMService(config);
        this.audioPlayer = createAudioPlayer();

        // Ruby will remain interested for her attention span (config.json - in ms)
        // Starting with no specific attention to anyone or conversation.
        this.roobeeAttention = null;
        this.roobeeAttentionSpan = null;
        this.attentionTimerId = null;

        // Empty conversation
        this.conversation = null;
    }

    run(){
        console.info('Wake Up Roobee...');
        // register listeners
        this.startEventHandlers();

        //Create empty conversation
        this.conversation = new Conversation(this.config);
    };

    startEventHandlers(){
        const client = this.discordService.client
        //Add speech events
        addSpeechEvent(client);

        // Roobee joins the channel of the user who @'s 
        client.on(Events.MessageCreate, (msg) => {
            let voiceChannel = msg.member?.voice.channel;
            if (voiceChannel) {
              let voiceConnection = joinVoiceChannel({
                  channelId: msg.member.voice.channelId,
                  guildId: msg.guildId,
                  adapterCreator: msg.guild.voiceAdapterCreator,
              });
              this.discordService.voiceConnection = voiceConnection ;
            };
        });

        // Ready Events
        client.on(Events.ClientReady, () => {
            console.log("Ready!");
        });

        // Speech Events
        client.on(SpeechEvents.speech, (msg) => {
            // If bot didn't recognize speech, content will be empty
            if (!msg.content) { console.log('didnt understand/no speech'); return;}
            let username = msg.author.globalName;
            console.log(username, ' is speaking');
            //Asking Roobee to leave
            if (this.matchPhrases(msg.content, this.config.roobee.quitPhrases)) {
              let connection = getVoiceConnection(msg.guild.id);
              console.info('COMMAND: Quitting...');
              connection.destroy();
            //Or to be quiet (arbitary length defined so she doesnt see it in a task description or some other phrase and get confused.)
            } else if ((this.matchPhrases(msg.content,this.config.roobee.names)) && (this.matchPhrases(msg.content, this.config.roobee.shushPhrases))){
                console.info('COMMAND: Shushed...');
                this.shush();
            // Or for a scripted interaction (Not Implemented Yet.)
            } else if (false){
                console.log('Attempted scripted interaction for this message.');
            //Let Roobee move on.
                this.conversation.forgetConversation();
            } else {
             // Track the conversation to determine interest, and respond.
                this.conversation.trackConversation(msg, (input) => this.respond(input));
            };
        });
    };

    shush(){
        this.audioPlayer.stop();
    };

    // Takes string and array - returns true if there are any matches. (lowercase to avoid capitalisation on speech recognition)
    matchPhrases(content, phrases){
        return phrases.some(phrase => content.toLowerCase().includes(phrase.toLowerCase()));
    };

    flashAttention(person) {
        // Clear previous timer if it exists
        if (this.attentionTimerId) {
          clearTimeout(this.attentionTimerId);
        };
      
        // Roobee will listen to others when the timeout listeningAttentionSpan is reached.
        this.attentionTimerId = setTimeout(()=> {
            this.roobeeAttention = null;
            console.log('Roobee is listening to anyone.');
        }, this.config.roobee.listeningAttentionSpanInMilli);
      
        // Roobee is engaged in a conversation - listeningAttentionSpan being refreshed by the 'person' talking
        this.roobeeAttention = person;
        console.log('Roobee is listening to ' + person);
    };

    async generateResponse(msg){
        let userPrompt = msg.content;
        // Load/start relationship
        var relationship = new Relationship(this.config, msg.author.username);

        // Get conversation history or Start history
        let llmRequestMessage = this.conversation.getConversation(relationship);
        llmRequestMessage.push({ "role": "user", "content": userPrompt });

        // below logging can be useful if debugging - will fix when implementing logger.
        // console.log(llmRequestMessage);

        // Get Roobee's response.
        let response = await this.llmService.llmRequest(llmRequestMessage, this.config.roobee.temperature);

        // A lot of RP LLMs put emoji's and other characters that can break TTS engines.
        // The below should clean it up.
        let cleanResponse = response.content.replace('&',' and ').replace(/[`~@#$%^*()_|+\-=;:"<>\{\}\[\]\\\/]/gi, '');

        // Add the back and forth for future updates to this conversation (Roobee's memory)
        this.conversation.updateConversation(response, (messages) => relationship.evaluateRelationship(messages));

        // Say it.
        this.voiceEngine.say(cleanResponse, this.discordService.voiceConnection, this.audioPlayer);
    };

    respond(msg){
        //If Roobee isnt focussed, or is responding to who she is focussed on.
        if (!this.roobeeAttention || this.roobeeAttention == msg.author.globalName){
            this.flashAttention(msg.author.globalName);
            this.generateResponse(msg);
        } else {
            //Roobee is distracted
            console.log('Roobee is too distracted to respond to ' + msg.author.globalName);
            return
        };
    };
};

module.exports = Roobee;