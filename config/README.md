<h1 align="center">
  <br>
  <a href="https://github.com/Mattabyte/Roobee"><img src="../docs/.gitbook/assets/roobee_pic.png" height="300" alt="Roobee AI Discord Chatbot"></a>
  <br>
  Roobee AI Discord Chatbot
  <br>
</h1>

<p align="center">Hi! I'm Roobee. Come chat in discord with me!</p>

<br>

## 📋 Config

This is where Roobee is configured.
From what she sounds like, is interested in, scripted outcomes and how she behaves.
This is what gives this bot it's personality.

By default, Roobee is the digital representation of Ruby - a fictional character developed by Mattabyte.
She's a blast, but not everyones cup of tea.
If you want to develop your own character, these files are the place to do it.

### config.json
The config.json file needs whatever keys to the services you are using.

Roobee is fastest when run locally, but support for external LLM's is coming soon.

At the moment Roobee supports 3 voice services: 
- Azure Speech Services
- Elevenlabs.io 
- Default (system) TTS.

You can select which to use with the 'use' section of the config.json. Just make sure you add the keys/settings relating to which 
service you 'use'. Default TTS requires no configuration.
#### (Dont forget to rename config_example.json to config.json !)


### systemprompt.txt

This is where Roobee gets her manners and personality. By default she should be a friendly chat companion.
If she isn't or you want to add your own flair, just update the prompt in systemprompt.txt to suit.
#### (Dont forget to rename systemprompt_example.txt to systemprompt.txt !)
