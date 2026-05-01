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

  console.log("✅ Painel enviado.");
});

// BOAS-VINDAS
client.on("guildMemberAdd", async (member) => {
  await member.send(`🔥 **SEJA MUITO BEM VINDO AO Theo Carrasco** 🔥`)
    .catch(() => console.log(`DM fechada para: ${member.user.tag}`));
});

// SISTEMA DE TICKET
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isButton()) return;

  if (interaction.customId === "abrir_ticket") {
    const nomeCanal = `ticket-${interaction.user.id}`;

    const canalExiste = interaction.guild.channels.cache.find(
      c => c.name === nomeCanal
    );

    if (canalExiste) {
      return interaction.reply({
        content: `❌ Você já tem um ticket aberto.`,
        ephemeral: true
      });
    }

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
            PermissionFlagsBits.SendMessages
          ]
        }
      ]
    });

    const fechar = new ButtonBuilder()
      .setCustomId("fechar_ticket")
      .setLabel("Fechar Ticket")
      .setStyle(ButtonStyle.Danger);

    const rowFechar = new ActionRowBuilder().addComponents(fechar);

    await ticketChannel.send({
      content: `👋 ${interaction.user}, descreva seu problema.`,
      components: [rowFechar]
    });

    interaction.reply({
      content: `✅ Ticket criado!`,
      ephemeral: true
    });
  }

  if (interaction.customId === "fechar_ticket") {
    await interaction.reply("🔒 Fechando em 5s...");
    setTimeout(() => {
      interaction.channel.delete().catch(() => {});
    }, 5000);
  }
});

// LOGIN
client.login(process.env.TOKEN);
