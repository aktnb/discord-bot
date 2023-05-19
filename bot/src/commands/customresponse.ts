import { CommandInteractionOptionResolver, SlashCommandBuilder } from "discord.js";
import { CommandHandler } from "../core";
import { CustomResponseController } from "../controller/CustomResponseController";
import { Response } from "../entity/Response";

export const handler = new CommandHandler(
  new SlashCommandBuilder()
    .setName('customresponse')
    .setDescription('カスタムレスポンスを設定します')
    .addSubcommand(cmd =>
      cmd
        .setName('add')
        .setDescription('新しいカスタムレスポンスを登録します')
        .addStringOption(option =>
          option
            .setName('key')
            .setDescription('キーとなる文字列')
            .setRequired(true)
        )
        .addStringOption(option =>
          option
            .setName('response')
            .setDescription('キーに対するカスタムレスポンス')
            .setRequired(true)
        )
    )
    .addSubcommand(cmd =>
      cmd
        .setName('del')
        .setDescription('カスタムレスポンスを取り消します')
        .addStringOption(option =>
          option
            .setName('key')
            .setDescription('取り消すカスタムレスポンスのキー')
            .setRequired(true)
        )
    )
    .addSubcommand(cmd =>
      cmd
        .setName('list')
        .setDescription('このサーバーで登録しているカスタムレスポンスの一覧を表示します')
    ),
  async interaction => {
    //  ギルドから実行されているか確認
    if (!(interaction.guild)) {
      await interaction.reply({
        content: 'サーバーから実行してね'
      });
      return;
    }

    if (interaction.user.bot) {
      return;
    }

    const options = interaction.options as CommandInteractionOptionResolver;
    const subCommand = options.getSubcommand();

    if (subCommand === 'add') {
      //  追加処理
      await interaction.deferReply({ ephemeral: true });
      const key = options.getString('key');
      const response = options.getString('response');
      if (!key || !response) {
        await interaction.editReply({ content: 'key, responseを設定してください.' });
        return;
      }
      if (key.startsWith('/') || response.startsWith('/') || response.startsWith('@')) {
        await interaction.editReply({ content: 'key, responseの文字列が不適切です' });
        return;
      }
      try {
        await CustomResponseController.addCustomResponse(key, response, interaction.user, interaction.guild);
      } catch (e) {
        if (e instanceof Error) {
          if (e.message === 'duplicated') {
            await interaction.editReply({ content: `key:${key} は既に使われています`});
            return;
          }
        }
        console.error(e);
        await interaction.editReply({ content: 'Unknown Error'});
      }
      await interaction.editReply({ content: `\`${key}\` に対するレスポンス \`${response}\` が ${interaction.guild.name} に追加されました`});
      return;
    }

    if (subCommand === 'del') {
      //  削除処理
      await interaction.deferReply({ ephemeral: true });
      const key = options.getString('key');
      if (!key) {
        await interaction.editReply({ content: 'keyを設定してください' });
        return;
      }
      try {
        const affected = await CustomResponseController.delCustomResponse(key, interaction.user, interaction.guild);

        if (!affected) {
          await interaction.editReply({
            content: `\`${interaction.guild.name}\` で \`${key}\` に対するカスタムレスポンスは登録されていないようです`
          });
          return;
        }

        await interaction.editReply({
          content: `\`${interaction.guild.name}\` における \`${key}\` に対するカスタムレスポンスを削除しました`
        });
        return;

      } catch (e) {
        console.error(e);
        await interaction.editReply({ content: 'Unknown Error'});
      }
      return;
    }

    if (subCommand === 'list') {
      await interaction.deferReply({ ephemeral: false });
      try {
        const responses = await CustomResponseController.getGuildsCustomResponses(interaction.guild);

        if (responses.length === 0) {
          await interaction.editReply({
            content: `\`${interaction.guild.name}\` にカスタムレスポンスは登録されていません`
          });
          return;
        }

        const msg = (await Promise.all(responses.map(async ( res: Response ) => {
          const author = await interaction.guild?.members.fetch(res.author.userId);
          return `${res.key} -> ${res.response} : ${author?.displayName}`;
        }))).join('\n');

        await interaction.editReply({
          content: `\`${interaction.guild.name}\` には以下のカスタムレスポンスが登録されています\`\`\`\n${msg}\n\`\`\``
        });
      } catch (e) {
        console.error(e);
        await interaction.editReply({ content: 'Unknown Error'});
      }
    }
  }
);