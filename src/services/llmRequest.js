// Make an API call to an inference endpoint and return the result.
// The endpoint is in config.json and should be the chat completions endpoint of whatever service you choose to use.
// Based on Pygmalion LLM Model Formatting and a Local LM Studio endpoint.
// Will consider extending to handle public services.


class LLMService {
    constructor(config){
        console.info('Starting LLM Service...');
        this.config = config;
        this.startService()
        return this;
    };

    //Singleton
    startService(){
        if(!this.llmService){
            this.llmService = this.configureService(this.config);
        } else {
            return 
        }
    }

    configureService(){
        // Determine service provider from config
        let serviceProvider = null;
        switch(this.config.llmConfig.use) {
            case 'openai':
              // Use Open AI API Service
              const OpenAIService = require('@llm/OpenAI');
              serviceProvider = new OpenAIService(this.config);
              break;
            default:
              // By Default, use LM Studio locally.
              const LMStudioService = require('@llm/lmStudio');
              serviceProvider = new LMStudioService(this.config);
              break;
        };

        if (serviceProvider){
            return serviceProvider;
        } else {
            throw new Error(`Failed to load LLM Service: ${err.message}`);
        };
    };

    // Ensures the LLM endpoint is available, catches malformed request/response
    // The test message is a simple system prompt and user prompt.
    async testRequest(){
        let testMessage = [];
        testMessage.push({ "role": "system", "content": "Only answer with the single word: Yes." });
        testMessage.push({ "role": "user", "content": "OK?" })
        try {
            let response = await this.llmService.llmRequest(testMessage, 0.1)
        } catch (err) {
            throw new Error(`Error connecting to LLM Endpoint (Check configuration): ${err.message}`);
        }
    };

    // Takes an appropriately formatted message ( like [{ "role": "system", "content": "Only answer with the single word: Yes." },{ "role": "user", "content": "OK?" }] ) - includes prompts.
    // And a temperature as a float between 0 and 1 (0.7 is usually the default.) this is how varied a response can be. 
    // Responds with the LLM Message (which has the .content attribute for the actual textual response of the model)
    async llmRequest(messages, temperature){
        let response = await this.llmService.llmRequest(messages, temperature);
        return response;
    };
};

module.exports = LLMService;