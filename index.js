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
const TEMPO_CASTIGO = 7 * 24 * 60 * 60 * 1000; // 7 dias

// BOT ONLINE
client.once("clientReady", () => {
  console.log(`✅ Bot online como ${client.user.tag}`);
});

// BOAS-VINDAS
client.on("guildMemberAdd", async (member) => {
  try {
    await member.send(`🔥 **SEJA MUITO BEM VINDO AO Theo Carrasco** 🔥`);
  } catch {
    console.log(`DM fechada para: ${member.user.tag}`);
  }
});

// COMANDOS E MODERAÇÃO
client.on("messageCreate", async (message) => {
  if (message.author.bot || !message.guild || !message.member) return;

  const msg = message.content.toLowerCase();

  // --- COMANDO !CA ---
  if (msg === "!ca") {
    return message.reply("Carrasco BOT está online 🔥");
  }

  // --- COMANDO LIMPAR CHAT ---
  if (msg.startsWith("!limpar")) {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
      return message.reply("❌ Você não tem permissão para usar este comando.");
    }

    const args = message.content.split(" ");
    const quantidade = parseInt(args[1]);

    if (!quantidade || quantidade < 1 || quantidade > 100) {
      return message.reply("Use: `!limpar 1-100`.");
    }

    try {
      const deleted = await message.channel.bulkDelete(quantidade, true);
      const aviso = await message.channel.send(`🧹 Apaguei **${deleted.size}** mensagens.`);
      setTimeout(() => aviso.delete().catch(() => {}), 3000);
    } catch (err) {
      console.error("Erro ao limpar chat:", err);
      return message.reply("❌ Erro ao apagar mensagens.");
    }
  }

  // --- CANAL PROIBIDO ---
  if (message.channel.id === CANAL_PROIBIDO) {

    // Ignora admins ou cargo imune
    if (
      message.member.roles.cache.has(CARGO_IMUNE) ||
      message.member.permissions.has(PermissionFlagsBits.Administrator)
    ) {
      return;
    }

    try {
      // Deleta a mensagem
      if (message.deletable) {
        await message.delete();
      }

      // Aplica punição
      if (message.member.moderatable) {
        await message.member.timeout(
          TEMPO_CASTIGO,
          "Enviou mensagem em canal proibido"
        );

        // MENSAGEM FICA NO CANAL
        await message.channel.send(
          `🚫 ${message.author} foi punido por 7 dias por falar aqui.`
        );

      } else {
        console.log(`Hierarquia insuficiente para punir: ${message.author.tag}`);
      }

    } catch (error) {
      console.error("Erro no sistema de canal proibido:", error);
    }
  }
});

// LOGIN
client.login(process.env.TOKEN);
