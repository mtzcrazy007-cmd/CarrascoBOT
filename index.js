const { Client, GatewayIntentBits } = require("discord.js");

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

client.once("ready", () => {
  console.log(`Carrasco Bot online como ${client.user.tag}`);
});

client.login(process.env.TOKEN);
