import { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder } from "discord.js";
import { buildDeploymentDiscordPayload } from "../src/discord/payloads.js";

const token = String(process.env.DISCORD_BOT_TOKEN || "").trim();
const appId = String(process.env.DISCORD_APP_ID || process.env.DISCORD_CLIENT_ID || "").trim();
const guildId = String(process.env.DISCORD_GUILD_ID || "").trim();
const defaultChannelId = String(process.env.DISCORD_DEALS_CHANNEL_ID || process.env.DISCORD_CHANNEL_ID || "").trim();

if (!token) {
  console.error("[discord-bot] Missing DISCORD_BOT_TOKEN");
  process.exit(1);
}
if (!appId) {
  console.error("[discord-bot] Missing DISCORD_APP_ID (or DISCORD_CLIENT_ID)");
  process.exit(1);
}

const commands = [
  new SlashCommandBuilder().setName("ping").setDescription("Check if the bot is alive."),
  new SlashCommandBuilder()
    .setName("deploy_notify")
    .setDescription("Post a deployment card with action buttons.")
    .addStringOption((o) =>
      o.setName("version").setDescription("Version ID (optional)").setRequired(false),
    )
    .addStringOption((o) =>
      o.setName("worker_url").setDescription("Workers URL (optional)").setRequired(false),
    )
    .addStringOption((o) =>
      o
        .setName("channel_id")
        .setDescription("Target channel ID (optional, defaults to current channel)")
        .setRequired(false),
    ),
];

async function registerCommands() {
  const rest = new REST({ version: "10" }).setToken(token);
  const body = commands.map((c) => c.toJSON());
  if (guildId) {
    await rest.put(Routes.applicationGuildCommands(appId, guildId), { body });
    console.log(`[discord-bot] Registered ${body.length} guild slash commands.`);
    return;
  }
  await rest.put(Routes.applicationCommands(appId), { body });
  console.log(`[discord-bot] Registered ${body.length} global slash commands.`);
}

async function postDeployCardToChannel(client, channelId, version, workerUrl) {
  if (!channelId) throw new Error("No channel available for deploy card.");
  const channel = await client.channels.fetch(channelId);
  if (!channel || !channel.isTextBased()) throw new Error("Target channel is not text-based.");
  const payload = buildDeploymentDiscordPayload({ versionId: version, workerUrl });
  await channel.send(payload);
}

async function main() {
  await registerCommands();

  const client = new Client({
    intents: [GatewayIntentBits.Guilds],
  });

  client.once("ready", () => {
    console.log(`[discord-bot] Ready as ${client.user?.tag || "unknown"}`);
  });

  client.on("interactionCreate", async (interaction) => {
    if (!interaction.isChatInputCommand()) return;
    try {
      if (interaction.commandName === "ping") {
        await interaction.reply({ content: "pong", ephemeral: true });
        return;
      }

      if (interaction.commandName === "deploy_notify") {
        const version = interaction.options.getString("version") || "";
        const workerUrl = interaction.options.getString("worker_url") || "";
        const selectedChannel = interaction.options.getString("channel_id") || "";
        const channelId = selectedChannel || interaction.channelId || defaultChannelId;
        await postDeployCardToChannel(interaction.client, channelId, version, workerUrl);
        await interaction.reply({
          content: `Deployment card posted in <#${channelId}>.`,
          ephemeral: true,
        });
        return;
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Unknown error";
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({ content: `Error: ${msg}`, ephemeral: true });
      } else {
        await interaction.reply({ content: `Error: ${msg}`, ephemeral: true });
      }
    }
  });

  await client.login(token);
}

main().catch((e) => {
  console.error("[discord-bot] Fatal:", e?.message || e);
  process.exit(1);
});

