// Update the config.json 'use' field to 'azure' to use this.
// This class builds and describes the Azure TTS service for rendering speech (with the details in config.json).
// It is the target of the 'say' action.
// Azure TTS returns ArrayBuffer for audio data, which can be streamed with the ArrayBuffer util.

const { SpeechSynthesisOutputFormat, SpeechConfig, SpeechSynthesizer } = require("microsoft-cognitiveservices-speech-sdk");
const { createAudioResource, StreamType } = require("@discordjs/voice");
const ArrayBufferToStream = require('@utils/arrayBufferToStream');

class AzureSpeechService {
    constructor(config){
        console.info('Selecting Azure Speech Service...');
        this.config = config;
        this.speechConfig = SpeechConfig.fromSubscription(config.voiceEngine.azure.subkey, config.voiceEngine.azure.region);
        this.speechConfig.speechSynthesisOutputFormat = SpeechSynthesisOutputFormat.Ogg24Khz16BitMonoOpus;
        this.azureSSMLMessageDefinition = config.voiceEngine.azure.ssmlFileContent;
        return this;
    };

    // Takes in the Text to render as speech, subscribes the audioplayer to the voice channel
    // Streams the result into the channnel (the Azure TTS response contains audioData [arraybuffer] that needs to be chunked/streamed)
    renderSpeechToChannel(text, voiceChannel, audioPlayer){
        let azureSSMLMessage = this.azureSSMLMessageDefinition.replace('{{lang}}',this.config.voiceEngine.azure.lang).replace('{{voice}}',this.config.voiceEngine.azure.voice).replace('{{text}}',text)
        // Sends off text to be converted to speech and rendered as audio to the provided player (which is subbed to a channel.)
        console.time("TTS Service Response Time: ");
        let speechSynthesizer = new SpeechSynthesizer(this.speechConfig);
        speechSynthesizer.speakSsmlAsync(azureSSMLMessage,
            result => {
                if (result) {
                    // If you want the response for Id/etc -> Also contains error info if failed.
                    // This speech systhesis call can fail if the text contans special characters from your LLM
                    // console.info(JSON.stringify(result));
                    let ttsArrayBuffer = result.audioData;
                    let audioStream = new ArrayBufferToStream(ttsArrayBuffer);
                    let audioResource = createAudioResource(audioStream, { inputType: StreamType.OggOpus });
                    voiceChannel.subscribe(audioPlayer);
                    audioPlayer.play(audioResource);
                    console.timeEnd("TTS Service Response Time: ");
                }
                speechSynthesizer.close();
            },
            error => {
                console.log(error);
                speechSynthesizer.close();
            }   
        );
    };
};

module.exports = AzureSpeechService;