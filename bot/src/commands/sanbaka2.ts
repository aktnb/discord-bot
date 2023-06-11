import { CommandInteractionOptionResolver, SlashCommandBuilder } from "discord.js";
import { CommandHandler } from "../core";
import { SanbakaController } from "../controller/SanbakaController";

export const handler = new CommandHandler(
  new SlashCommandBuilder()
    .setName('sanbaka2')
    .setDescription('画像がさんばかの誰かを推測するよ v2')
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
    const image = options.getAttachment('image')
    if (!image || !image.url) {
      await interaction.reply('画像が無いかも？');
      return;
    }

    await interaction.deferReply();

    try {
      const predict = await SanbakaController.predict2(image.url);
      await interaction.editReply({ content: `この画像は \`${predict}\` じゃないかな～`, files: [image.url] });
    } catch (e) {
      if (e instanceof Error)
        await interaction.editReply({ content: e.message, files: [image.url] });
      else
        await interaction.editReply('予測中に予期せぬエラーが発生しました');
    }
  }
);
