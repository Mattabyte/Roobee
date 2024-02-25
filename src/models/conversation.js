// This class interacts with 'conversations' - an array of sampled spoken interactions 
// It can use the LLM service to infer the conversation of the topic.
// It can emit events based on Roobee's interest in the current topic so Roobee can chime in.
const Prompt = require('@models/prompt');

class Conversation {
    // Roobee has a state object that is used to keep track of the current state of Roobee, like mood, etc.
    constructor(config) {
        console.log('Starting a conversation...');
        this.config = config;
        this.buffer = [];
        this.messages = [];
        this.prompt = new Prompt(config, this.config.llmConfig.systemPromptFile);
        this.timerId = null;
        return this
    };

    getConversation(relationship){
        //If its a new conversation, add the system prompt 
        if (this.messages.length == 0){
            console.log('New Conversation...');
            let influences = `You responses to the user should always be ${relationship.data.influence.attitude.join(' ')}`;
            this.messages.push({ "role": "system", "content": this.prompt.system + influences });
        };
        return this.messages;
    };

    isInConversation(){
        // 1 because theres a system prompt
        if (this.messages.length > 1){
            return true;
        } else {
            return false;
        };
    };
    
    updateConversation(new_messages, relationshipCallback){
        this.engagedInConversation();
        this.messages.push(new_messages);
        // Consider/update the relationship if the conversation is long enough
        if (this.messages.length > 5){
            relationshipCallback(this.messages)
        };
    };

    // Takes string and array - returns true if there are any matches. (lowercase to avoid capitalisation on speech recognition)
    matchPhrases(content, phrases){
        return phrases.some(phrase => content.toLowerCase().includes(phrase.toLowerCase()));
    };

    forgetConversation(){
        this.messages = [];
        this.buffer = [];
        console.log('Roobee lost interest in the conversation.');
    };

    engagedInConversation() {
        // Clear previous timer if it exists
        if (this.timerId) {
          clearTimeout(this.timerId);
        };
      
        // Roobee has lost interest.
        this.timerId = setTimeout(()=> {
            this.forgetConversation();
        }, this.config.roobee.conversationAttentionSpanInMilli);
      
        // Roobee is engaged in a conversation
        console.log('Roobee is still engaged in the conversation');
    };

    trackConversation(msg, callback){
        //remove oldest conversation element to preserve 5 in a context window
        if (this.buffer.length > 5){ 
            //Clear buffer
            this.buffer = [];
        };
        
        this.buffer.push({"username": msg.author.username , "content": msg.content});

        // See if Roobee is engaged in conversation, and continue it
        if (this.isInConversation()){
            //need to pass back action?
            callback(msg);
        };

        // Someone is talking to Roobee
        if (!(this.isInConversation()) && (this.matchPhrases(msg.content, this.config.roobee.names))){
            callback(msg);
        };

        // Roobee might respond if the conversation interests her (but wait until buffer is full)
        if (this.buffer.length == 5) {
            // console.log(this.buffer);
            // TODO: Interest
            //Roobee will register her interest in the conversation class and wait to voice her input
            // var interested = this.conversation.interestsRoobee(this.conversationBuffer, msg);
            // if(interested){
            //     //Clear the buffer (so she doesnt keep triggering interest.)
            //     this.participateInConversation(this.conversationBuffer)
            //     this.buffer = [];
            // };
        };
    };
};

module.exports = Conversation;