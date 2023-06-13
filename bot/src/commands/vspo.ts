import { CommandInteractionOptionResolver, SlashCommandBuilder } from "discord.js";
import { CommandHandler } from "../core";
import { VspoController } from "../controller/VspoController";

export const handler = new CommandHandler(
  new SlashCommandBuilder()
    .setName('vspo')
    .setDescription('画像がVspoの誰かを推測するよ')
    .addAttachmentOption(option =>
      option
        .setName('face')
        .setDescription('分類したい画像')
        .setRequired(true)),
  async interaction => {
    if (interaction.user.bot) {
      return;
    }

    const options = interaction.options as CommandInteractionOptionResolver;
    const image = options.getAttachment('face')
    if (!image || !image.url) {
      await interaction.reply('画像が無いかも？');
      return;
    }

    await interaction.deferReply();

    try {
      const predict = await VspoController.predict(image.url);
      await interaction.editReply({ content: `この画像は \`${predict}\` じゃないかな～`, files: [image.url] });
    } catch (e) {
      if (e instanceof Error)
        await interaction.editReply({ content: e.message, files: [image.url] });
      else
        await interaction.editReply('予測中に予期せぬエラーが発生しました');
    }
  }
);
