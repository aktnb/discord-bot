import { APIEmbed, SlashCommandBuilder } from "discord.js";
import { CommandHandler } from "../core";
import { NewsAPIController } from "../controller/NewsApiController";
import { EmbedBuilder } from "@discordjs/builders";

export const handler = new CommandHandler(
  new SlashCommandBuilder()
    .setName('news')
    .setDescription('日本のニュースを10個表示します'),
  async interaction => {
    if (interaction.user.bot) {
      return;
    }

    const newses = await NewsAPIController.getTopHeadlines();
    const embeds: APIEmbed[] = [];
    for (const news of newses) {
      const embed = new EmbedBuilder()
        .setColor(0x0099FF)
        .setTitle(news.title)
        .setURL(news.url)
        .setAuthor({ name: news.source })
        .setDescription(news.description ? news.description : 'no description')
        .setTimestamp(news.published_at);
      if (news.urlToImg) {
        embed.setImage(news.urlToImg);
      }
      embeds.push(embed.data);
    }
    await interaction.channel?.send({ embeds: embeds});
  }
);
