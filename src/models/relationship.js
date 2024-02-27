// The relationship class builds/updates a relationship with a user.
// It uses the relationships folder to store it.
// By default the file default_relationship.json is used to 'flavour' responses.
// Roobee's relationship with someone is 'cemented' after 10 entries. After this, the relationship file becomes a 'point-of-truth' and is not updated.
// This is to prevent constant updates resulting in big files. This could be extended in the future to allow overriding of a 'cemented' relationship
const fs = require('fs');
const path = require('path');
const LLMService = require('@services/llmRequest');
const Prompt = require('@models/prompt');

class Relationship {
    constructor(config, person){
        this.person = person;
        this.config = config;
        this.relationshipFilename = `relationship_${person}_.json`;
        this.data = this.loadRelationshipData(person);
        this.relationshipLlmService = new LLMService(this.config);
        return this;
    };

    loadRelationshipData(person){
        // format based on users name by id - as the globalName can be anything.
        if (fs.existsSync(path.join(this.config.rootpath, `/config/relationships/user/${this.relationshipFilename}`))){
        // Load relationsip
            return JSON.parse(fs.readFileSync(path.join(this.config.rootpath, `/config/relationships/user/${ this.relationshipFilename }`), 'utf8'));
        } else {
        // Create from default  
            let defaultRealationship = JSON.parse(fs.readFileSync(path.join(this.config.rootpath, `/config/relationships/defaultRelationship.json`), 'utf8'));
            return defaultRealationship;
        };
    };

    saveRelationshipData(){
        // Save Data to file.
        if(this.data.cemented){
            //Relationship is cemented - cant update.
            return;
        };

        // Cement the relationship if 5 or more influence attributes are in the data array
        if(this.data.influence.attitude.length >= 5){
            this.data.cemented = true;
        };
        let updaterelationship = JSON.stringify(this.data, null, 4);
        fs.writeFileSync(path.join(this.config.rootpath, `/config/relationships/user/${this.relationshipFilename}`), updaterelationship);
    };


    // This method takes in the conversation so far and makes a separate request to the LLM to look at 
    // the messages and determine the 'feeling' of these phrases to give Roobee a sense of how to 
    // interact with this person in the future. Its determination and reponse is driven by evaluationprompt.txt
    async evaluateRelationship(messages){
        let llmRequestMessages = [];
        let userMessages = [];

        // We only want the users input, not the 'assistants' reponses
        userMessages = messages
            .filter(message => message.role === 'user')
            .map(message => message.content);

        // Build the evaluation request for the LLM to use 
        let evaluationPrompt = new Prompt(this.config, `relationships/evaluationprompt.txt`);
        llmRequestMessages.push({ "role": "system", "content": evaluationPrompt.system });
        llmRequestMessages.push({ "role": "user", "content": JSON.stringify(userMessages) });

        // Low temperature request for this task as we need the input to be predictable (because we cast as an array)
        let response = await this.relationshipLlmService.llmRequest(llmRequestMessages, 0.3);

        // This can really break Roobee if the responses cant be cast to an array properly. 
        // This method should be refactored to build the array more reliably. 
        this.data.influence.attitude = JSON.parse(response.content);
        this.saveRelationshipData();
    }
};

module.exports = Relationship;