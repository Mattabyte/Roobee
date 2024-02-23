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

    async evaluateRelationship(messages){
        let llmRequestMessages = [];
        let llmService = new LLMService(this.config);
        let userMessages = messages
            .filter(message => message.role === 'user')
            .map(message => message.content);
        let evaluationPrompt = new Prompt(this.config, `relationships/evaluationprompt.txt`);
        llmRequestMessages.push({ "role": "system", "content": evaluationPrompt.system });
        llmRequestMessages.push({ "role": "user", "content": JSON.stringify(userMessages) });
        let response = await llmService.llmRequest(llmRequestMessages);
        this.data.influence.attitude = JSON.parse(response.content);
        this.saveRelationshipData();
    }
};

module.exports = Relationship;