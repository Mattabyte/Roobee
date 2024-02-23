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
        this.voiceEngine = new VoiceEngine(config);
        this.discordService = new Discord(config);
        this.llmService = new LLMService(config);
        this.audioPlayer = createAudioPlayer();
        this.roobeeAttention = null;
        this.conversation = null;
        this.attentionTimerId = null;
    };

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
            //Let ruby move on.
                this.conversation.forgetConversation();
            } else {
             // Call out to see if responding, or interested in responding.
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
      
        // Roobee will listen to others.
        this.attentionTimerId = setTimeout(()=> {
            this.roobeeAttention = null;
            console.log('Ruby is listening to anyone.');
        }, this.roobeeAttentionSpan);
      
        // Roobee is engaged in a conversation
        console.log('Ruby is listening to ' + person);
    };

    async generateResponse(msg){
        let userPrompt = msg.content;
        // Load/start relationship
        var relationship = new Relationship(this.config, msg.author.username);
        // Get conversation history or Start history
        let llmRequestMessage = this.conversation.getConversation(relationship);
        llmRequestMessage.push({ "role": "user", "content": userPrompt });
        console.log(llmRequestMessage);
        let response = await this.llmService.llmRequest(llmRequestMessage);
        let cleanResponse = response.content.replace('&',' and ').replace(/[`~@#$%^*()_|+\-=;:"<>\{\}\[\]\\\/]/gi, '');
        this.conversation.updateConversation(response, (messages) => relationship.evaluateRelationship(messages));
        this.voiceEngine.say(cleanResponse, this.discordService.voiceConnection, this.audioPlayer);
    };

    respond(msg){
        //If Ruby isnt focussed.
        if (!this.roobeeAttention){
            this.flashAttention(msg.author.globalName);
            this.generateResponse(msg);
        } else {
            //Ruby is distracted
            console.log('Ruby is too distracted to respond to ' + msg.author.globalName);
            return
        };
    };
};

module.exports = Roobee;