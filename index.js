const {
  Client,
  GatewayIntentBits,
  ButtonBuilder,
  ActionRowBuilder,
  ButtonStyle,
  ChannelType,
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

const CANAL_PAINEL_TICKET = "1499826535295619173";
const IDS_EQUIPE = ["669163751957725204", "1036821871947165706"];

// BOT ONLINE + PAINEL
client.once("ready", async () => {
  console.log(`✅ Bot online como ${client.user.tag}`);

  const canal = await client.channels.fetch(CANAL_PAINEL_TICKET).catch(() => null);

  if (!canal) {
    return console.log("❌ Canal do painel de ticket não encontrado.");
  }

  try {
    const mensagens = await canal.messages.fetch({ limit: 10 });
    const mensagensDoBot = mensagens.filter(msg => msg.author.id === client.user.id);

    if (mensagensDoBot.size > 0) {
      await canal.bulkDelete(mensagensDoBot, true).catch(() => {});
    }
  } catch {
    console.log("Aviso: não consegui limpar mensagens antigas do bot.");
  }

  const botao = new ButtonBuilder()
    .setCustomId("abrir_ticket")
    .setLabel("Abrir Ticket")
    .setEmoji("🎫")
    .setStyle(ButtonStyle.Primary);

  const row = new ActionRowBuilder().addComponents(botao);

  await canal.send({
    content: `🎫 **CENTRAL DE ATENDIMENTO — Theo Carrasco**

Clique no botão abaixo para abrir um ticket privado com a equipe.`,
    components: [row]
  });

  console.log("✅ Painel de ticket enviado.");
});

// BOAS-VINDAS
client.on("guildMemberAdd", async (member) => {
  await member.send(`🔥 **SEJA MUITO BEM VINDO AO Theo Carrasco** 🔥`)
    .catch(() => console.log(`DM fechada para: ${member.user.tag}`));
});

// SISTEMA DE TICKET
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isButton()) return;
  if (!interaction.guild) return;

  if (interaction.customId === "abrir_ticket") {
    const nomeCanal = `ticket-${interaction.user.id}`;

    const canalExiste = interaction.guild.channels.cache.find(
      c => c.name === nomeCanal
    );

    if (canalExiste) {
      return interaction.reply({
        content: `❌ Você já tem um ticket aberto: ${canalExiste}`,
        ephemeral: true
      });
    }

    try {
      const ticketChannel = await interaction.guild.channels.create({
        name: nomeCanal,
        type: ChannelType.GuildText,
        permissionOverwrites: [
          {
            id: interaction.guild.id,
            deny: [PermissionFlagsBits.ViewChannel]
          },
          {
            id: interaction.user.id,
            allow: [
              PermissionFlagsBits.ViewChannel,
              PermissionFlagsBits.SendMessages,
              PermissionFlagsBits.ReadMessageHistory,
              PermissionFlagsBits.AttachFiles
            ]
          },
          ...IDS_EQUIPE.map(id => ({
            id,
            allow: [
              PermissionFlagsBits.ViewChannel,
              PermissionFlagsBits.SendMessages,
              PermissionFlagsBits.ReadMessageHistory,
              PermissionFlagsBits.AttachFiles
            ]
          }))
        ]
      });

      const fechar = new ButtonBuilder()
        .setCustomId("fechar_ticket")
        .setLabel("Fechar Ticket")
        .setEmoji("🔒")
        .setStyle(ButtonStyle.Danger);

      const rowFechar = new ActionRowBuilder().addComponents(fechar);

      await ticketChannel.send({
        content: `👋 Olá ${interaction.user}, descreva seu problema.

A equipe **Theo Carrasco** irá te atender em breve.`,
        components: [rowFechar]
      });

      return interaction.reply({
        content: `✅ Ticket criado: ${ticketChannel}`,
        ephemeral: true
      });

    } catch (error) {
      console.error("Erro ao criar ticket:", error);

      return interaction.reply({
        content: "❌ Erro ao criar o canal de ticket. Verifique as permissões do bot.",
        ephemeral: true
      });
    }
  }

  if (interaction.customId === "fechar_ticket") {
    await interaction.reply("🔒 Este ticket será fechado em 5 segundos...");

    setTimeout(() => {
      interaction.channel.delete().catch(() => {});
    }, 5000);
  }
});

// COMANDOS E MODERAÇÃO
client.on("messageCreate", async (message) => {
  if (message.author.bot || !message.guild || !message.member) return;

  if (message.content.toLowerCase() === "!nux") {
    return message.reply("Carrasco BOT está online 🔥");
  }

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

      return;
    } catch {
      return message.reply("Erro ao tentar apagar mensagens.");
    }
  }

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

    } catch (error) {
      console.log("Erro na punição: verifique se o cargo do bot está acima do cargo do usuário.");
    }
  }
});

client.login(process.env.TOKEN);
