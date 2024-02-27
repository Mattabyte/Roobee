// This class should be used to format and wrap prompts with:
//  -System prompt
//  -Relationship data (from the relationship class)
//  -Input Prefix/Suffix Tokens specific to your LLM Model
// 
// It is configured by the systemprompt section in the config folder.
// This is what impacts Roobee's behaviour more than anything else.
// IMPORTANT: If you haven't added (or copied from the example) a systemprompt.txt - Roobee wont know what to do.
const fs = require('fs');
const path = require('path');

class Prompt {
    constructor(config, promptFile){
        this.config = config;
        this.system = null;
        this.reloadPromptFile(promptFile);
        return this
    }

    reloadPromptFile(promptFile){
        // Return the System Prompt from config/systemprompt.txt
        let promptFileContent = fs.readFileSync(path.join(this.config.rootpath, `/config/${promptFile}`), 'utf8');
        this.system = promptFileContent;
        return this.system;
    };
};

module.exports = Prompt;
