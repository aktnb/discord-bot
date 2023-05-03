import { SlashCommandBuilder } from "discord.js";
import { CommandHandler } from "../core";

export const handler = new CommandHandler(
  new SlashCommandBuilder()
    .setName('github')
    .setDescription('botのソースコードページ'),
  async (interaction) => {
    if (interaction.user.bot) {
      return;
    }

    await interaction.reply({ content: 'https://github.com/aktnb/discord-bot' });
  }
);
