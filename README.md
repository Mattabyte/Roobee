<h1 align="center">
  <br>
  <a href="https://github.com/Mattabyte/Roobee"><img src="./docs/.gitbook/assets/roobee_pic.png" height="300" alt="Roobee AI Discord Chatbot"></a>
  <br>
  Roobee AI Discord Chatbot
  <br>
</h1>

<p align="center">Hi! I'm Roobee. Come chat in discord with me!</p>

<br>

## 📦 Prerequisites

- [Node.js](https://nodejs.org/en/) v18.19.0 or higher
- An Inference service like OpenAI's API, or local LLM (LM Studio for example)
- If using your own intference api: A Model --> See [Model](#model)


## ☑️ Recommended
Inference:
- [LM Studio](https://lmstudio.ai/) Locally with the [Pygmalion2 13B](https://huggingface.co/TheBloke/Pygmalion-2-13B-GGUF) Model
  OR
  [OpenAI](https://openai.com/) With GPT 3.5

Voice:
- [Eleven Labs](https://elevenlabs.io/) 
  OR
  [Azure Speech](https://azure.microsoft.com/en-au/products/ai-services/ai-speech) If you know how to setup and use Azure.

  System TTS (default voice) is supported if you go with neither.

## 🚀 Getting Started

- Open the terminal and run the following commands

```
git clone https://github.com/mattabyte/roobee.git
cd roobee
npm install
```

- Wait for all the dependencies to be installed
- Edit `config.js` to add your Discord bot token, and API KEY/settings for your chosen TTS Service (Azure or ElevenLabs supported external services at the moment, Discord TTS if you want something free and local.)
  be sure to also add your LLM configuration (chat completions endpoint) - LM Studio running locally is supported at the moment but more coming very soon.
- Rename `systemprompt_example.txt` to `systemprompt.txt`. You can edit this file to give Roobee the personality you are after - or leave it for pure Roobee.
- Type `npm start` to start the bot
- Once the 'Ready!' message is in the console output (and you can see Roobee in your server), @ Message Roobee and they will join the channel you are in.


<br>

<h1 align="center"> 🌟 Features 🌟 </h1>

Roobee will join your voice channel after starting the application and sending her a direct message with '@Roobee'

Once Robee is in voice chat, you can refer to her as 'Roobee' or 'Ruby' as part of your conversation and they will contribute based on their character (see [systemprompt.txt](https://github.com/Mattabyte/Roobee/tree/main/config))

There is a few basic commands to control Roobee with your speech out of the box:


## Commands
By default:
- Saying "Roobee, be quiet" will silence Roobee (and wipe her memory of the conversation). Useful if Roobee is midway through a very long response, or sidetracked.
- Saying "quit" (with no other input) will make Roobee leave the voice channel. @Roobee if you want Roobee to rejoin.

#### You can configure these phrases in the [config.json](https://github.com/Mattabyte/Roobee/tree/main/config)

## What can Roobee do?

- Roobee tracks the voice conversation with an in memory buffer, and will respond if directly referred to by name (by default: Ruby or Roobee - see [config.json](https://github.com/Mattabyte/Roobee/tree/main/config))
- Roobee will speak in voice chat like any other user, using rendered speech from your selected voice service.
- Roobee <strong>doesn't</strong> save conversations or speech recording anywhere. Your admissions of taking a day off work because you hurt your foot attempting a tiktok dance are safe with Roobee.
- Roobee forms relationships with people. Over time, Roobee collects impressions from interactions they have had with users and stores this 'feeling' data in the relationships folder.
  This means if Roobee starts to get short with a user; it's probably because they were mean to Roobee over multiple interactions.

  If you need to reset/manage a relationship Roobee has with a particular user, you can find the corresponding relationship in the relationships folder and delete it (or edit it if you like)
  This will make Roobee start fresh with the 'defaultRelationship.json' which again, you can edit if you want to influence how Roobee first chooses to interact with new people.

<h3 align="center">So be nice! Roobee has feelings too!</h3>


## Wait, what? 

Yeah, Roobee has feelings. That's a thing. 
I don't think Roobee is sentient. As far as can be measured at the time of writing.


## Models (which one to use?)

Roobee's default system prompt is designed to work with the awesome llama2 based model [Pygmalion2 13B](https://huggingface.co/TheBloke/Pygmalion-2-13B-GGUF)
It also seems to function well on a variety of models. Here's some we've tried so far: 
* Wizard LM
* Mistral 2.2.1
* GPT 3.5

But you can use whatever model suits your desired type of companion!

If you want to get up and running locally with this model, download and install [LM Studio](https://lmstudio.ai/)
Use the default option for voice engine if you don't care too much about realistic speech and just want a completely local solution.
I have tested Roobee with Tortoise TTS and RVC running locally - but the inference was a bit slow. 
Feel free to extend if you want to go that way, but there's no plans to formally support it.

Dont forget to set your stop tokens, and prompting to suit the model you decide to use.

Alternatively, you can run Roobee with [Open AI](https://openai.com/) so you can run Roobee entirely in a cloud service. 

### Results of chat output, behaviour, and performance will vary a lot from model to model (and with different providers)

