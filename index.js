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

// --- CONFIGURAÇÕES ---
const CANAL_PROIBIDO = "1499824373861716148";
const CARGO_IMUNE = "1490326565752668353";
const TEMPO_CASTIGO = 7 * 24 * 60 * 60 * 1000; // 7 dias em milissegundos

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
  // Ignora bots, mensagens fora de servidores ou se o membro não puder ser carregado
  if (message.author.bot || !message.guild || !message.member) return;

  const msg = message.content.toLowerCase();

  // --- COMANDO !CA ---
  if (msg === "!ca") {
    return message.reply("Carrasco BOT está online 🔥");
  }

  // --- COMANDO LIMPAR CHAT ---
  if (msg.startsWith("!limpar")) {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
      return message.reply("Você não tem permissão para usar este comando.");
    }

    const args = message.content.split(" ");
    const quantidade = parseInt(args[1]);

    if (!quantidade || quantidade < 1 || quantidade > 100) {
      return message.reply("Use: `!limpar 1-100`.");
    }

    try {
      const deleted = await message.channel.bulkDelete(quantidade, true);
      const aviso = await message.channel.send(`扫 Apaguei **${deleted.size}** mensagens.`);
      setTimeout(() => aviso.delete().catch(() => {}), 3000);
    } catch (err) {
      console.error("Erro ao limpar chat:", err);
      return message.reply("Houve um erro ao tentar apagar mensagens neste canal.");
    }
  }

  // --- LÓGICA DO CANAL PROIBIDO ---
  if (message.channel.id === CANAL_PROIBIDO) {
    // 1. Ignora se for Admin ou tiver o cargo imune
    if (
      message.member.roles.cache.has(CARGO_IMUNE) || 
      message.member.permissions.has(PermissionFlagsBits.Administrator)
    ) {
      return; 
    }

    try {
      // 2. Tenta deletar a mensagem
      if (message.deletable) {
        await message.delete();
      }

      // 3. Tenta aplicar o castigo (Timeout)
      if (message.member.moderatable) {
        await message.member.timeout(TEMPO_CASTIGO, "Enviou mensagem em canal proibido");

        const aviso = await message.channel.send(
          `🚫 ${message.author} foi punido por 7 dias por falar aqui.`
        );
        
        // Apaga o aviso do bot após 5 segundos
        setTimeout(() => aviso.delete().catch(() => {}), 5000);
      } else {
        console.log(`Hierarquia insuficiente para punir: ${message.author.tag}`);
      }

    } catch (error) {
      console.error("Erro no sistema de canal proibido:", error);
    }
  }
});

// LOGIN (Certifique-se de que o TOKEN está no seu arquivo .env ou substitua pela string)
client.login(process.env.TOKEN);
