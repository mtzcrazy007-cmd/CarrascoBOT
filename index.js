const {
  Client,
  GatewayIntentBits,
  PermissionFlagsBits
} = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ]
});

// CONFIGURAÇÕES
const CANAL_PROIBIDO = "1499824373861716148";
const CARGO_IMUNE = "1490326565752668353";
const TEMPO_CASTIGO = 7 * 24 * 60 * 60 * 1000;

// BOT ONLINE
client.once("ready", () => {
  console.log(`✅ Bot online como ${client.user.tag}`);
});

// BOAS-VINDAS
client.on("guildMemberAdd", async (member) => {
  await member.send(`🔥 **SEJA MUITO BEM VINDO AO Theo Carrasco** 🔥`)
    .catch(() => console.log(`DM fechada para: ${member.user.tag}`));
});

// COMANDOS E MODERAÇÃO
client.on("messageCreate", async (message) => {
  if (message.author.bot || !message.guild || !message.member) return;

  // COMANDO SIMPLES
  if (message.content.toLowerCase() === "!CA") {
    return message.reply("Carrasco BOT está online 🔥");
  }

  // LIMPAR CHAT
  if (message.content.toLowerCase().startsWith("!limpar")) {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
      return message.reply("Você não tem permissão para usar este comando.");
    }

    const quantidade = parseInt(message.content.split(" ")[1]);

    if (!quantidade || quantidade < 1 || quantidade > 100) {
      return message.reply("Use: `!limpar 1-100`.");
    }

    try {
      const deleted = await message.channel.bulkDelete(quantidade, true);

      const aviso = await message.channel.send(`🧹 Apaguei **${deleted.size}** mensagens.`);
      setTimeout(() => aviso.delete().catch(() => {}), 3000);

    } catch {
      return message.reply("Erro ao tentar apagar mensagens.");
    }
  }

  // CANAL PROIBIDO
  if (message.channel.id === CANAL_PROIBIDO) {
    if (message.member.roles.cache.has(CARGO_IMUNE)) return;

    try {
      await message.delete();

      await message.member.timeout(
        TEMPO_CASTIGO,
        "Enviou mensagem em canal proibido"
      );

      const aviso = await message.channel.send(
        `🚫 ${message.author} foi punido por 7 dias por falar aqui.`
      );

      setTimeout(() => aviso.delete().catch(() => {}), 5000);

    } catch {
      console.log("Erro: verifique permissões/cargo do bot.");
    }
  }
});

// LOGIN
client.login(process.env.TOKEN);
