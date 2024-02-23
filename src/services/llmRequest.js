// Make an API call to an inference endpoint and return the result.
// The endpoint is in config.json and should be the chat completions endpoint of whatever service you choose to use.
// Based on Pygmalion LLM Model Formatting and a Local LM Studio endpoint.
// Will consider extending to handle public services.

class LLMService {
    constructor(config){
        console.info('Starting LLM Service...');
        this.config = config;
        this.testEndpoint(config.llmConfig.endpoint);
        this.endpoint = config.llmConfig.endpoint;
        return this;
    };

    async testEndpoint(endpoint){
        try {
            var llmReponse = await this.testRequest(endpoint);
            console.info(`LLM Endpoint OK? ...Responded: ${llmReponse}`);
        } catch (err) {
            throw new Error(`Error connecting to LLM Endpoint: ${err.message}`);
        }
    };

    async testRequest(endpoint){
        let testMessage = '[{ "role": "system", "content": "Only answer with the single word: Yes." },{ "role": "user", "content": "OK?" }]'
        let response = await fetch(endpoint, {
            method: 'POST',
            headers: {"Content-Type": "application/json"},
            body:JSON.stringify({
                "messages": testMessage, 
                "temperature": 0.1, 
                "max_tokens": -1,
                "stream": false
            })
        })
        .then((response) => response.json())
        .then((responsetext) => { return responsetext })
        .catch((err) => { return err });
        if(await response.cause?.code){
            //Connection Error
            throw new Error(`LLM Connection Error: ${response.cause.code} Check Your LLM Configuration.`);
        } else if (await response.error){
            //Logic/Config Error
            throw new Error(`LLM Reponse Error: ${response.error} Check Your LLM Configuration.`);
        } else {
            return response.choices[0].message.content;
        }
    };

    async llmRequest(messages){
        console.time("LLM Service Response Time: ");
        let response = await fetch(this.endpoint, {
            method: 'POST',
            headers: {"Content-Type": "application/json"},
            body:JSON.stringify({
                "messages": messages, 
                "temperature": 0.7, 
                "max_tokens": -1,
                "stream": false
            })
        })
        .then((response) => response.json())
        .then((responsetext) => { return responsetext })
        .catch((err) => { return err });
        if (await response.error){
            throw new Error(`LLM Reponse Error:  ${response.error} Check Your LLM Configuration.`);
        } else {
            console.timeEnd("LLM Service Response Time: ");
            return response.choices[0].message
        }
    };
};

module.exports = LLMService;