import { CommandInteractionOptionResolver, SlashCommandBuilder } from "discord.js";
import { CommandHandler } from "../core";
import { NijisanjiController } from "../controller/NijisanjiController";

export const handler = new CommandHandler(
  new SlashCommandBuilder()
    .setName('nijisanji')
    .setDescription('画像がにじさんじの誰か(アンジュ・カトリーナ、葉加瀬冬雪、壱百満天原サロメ、戌亥とこ、ジョー・力一、加賀美ハヤト、リゼ・ヘルエスタ、竜胆尊、鷹宮リオン、夜見れな)を推測するよ')
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
      const predict = await NijisanjiController.predict(image.url);
      await interaction.editReply({ content: `この画像は \`${predict}\` じゃないかな～`, files: [image.url] });
    } catch (e) {
      if (e instanceof Error)
        await interaction.editReply({ content: e.message, files: [image.url] });
      else
        await interaction.editReply('予測中に予期せぬエラーが発生しました');
    }
  }
);
