import { ChannelType, CommandInteractionOptionResolver, GuildChannel, GuildMember, SlashCommandBuilder, VoiceChannel } from "discord.js";
import { CommandHandler } from "../core";
import { NotificationController } from "../controller/NotificationController";

export const handler = new CommandHandler(
  new SlashCommandBuilder()
    .setName('notification')
    .setDescription('botからの通知を設定します')
    .addSubcommand(cmd => 
      cmd
        .setName('add')
        .setDescription('新たな通知設定を追加します')
        .addChannelOption(option =>
          option
            .setName('voicechannel')
            .setDescription('対象のVoiceChannel')
            .setRequired(true)
            .addChannelTypes(ChannelType.GuildVoice)
        )
        .addBooleanOption(option =>
          option
            .setName('all')
            .setDescription('Trueの場合、2人目以降の入室も通知します Default: False')
            .setRequired(false)
        )
        .addBooleanOption(option =>
          option
            .setName('self')
            .setDescription('Trueの場合、自分自身の入室も通知します Default: False')
            .setRequired(false)
        )
        .addBooleanOption(option =>
          option
            .setName('always')
            .setDescription('Falseの場合、ステータスがオンラインの時のみ通知します Default: False')
            .setRequired(false)
        )
        .addBooleanOption(option =>
          option
            .setName('after')
            .setDescription('Trueの場合、自身が入室していても通知を継続します Default: False')
            .setRequired(false)
        )
    )
    .addSubcommand(cmd =>
      cmd
        .setName('list')
        .setDescription('設定している通知一覧を表示します')
    )
    .addSubcommand(cmd =>
      cmd
        .setName('del')
        .setDescription('通知設定を削除します')
        .addChannelOption(option =>
          option
            .setName('voicechannel')
            .setDescription('対象のVoiceChannel')
            .setRequired(true)
            .addChannelTypes(ChannelType.GuildVoice)
        )
    ),
  async interaction => {
    //  ギルドから実行されているか確認
    if (!(interaction.channel instanceof GuildChannel)) {
      await interaction.reply({
        content: 'サーバーから実行してね'
      });
      return;
    }

    const options = interaction.options as CommandInteractionOptionResolver;
    const subCommand = options.getSubcommand();

    await interaction.deferReply({ ephemeral: true });
    if (subCommand === 'add') {
      const all = !!options.getBoolean('all');
      const self = !!options.getBoolean('self');
      const always = !!options.getBoolean('always');
      const after = !!options.getBoolean('after');
      const voiceChannel = options.getChannel('voicechannel') as VoiceChannel;

      await NotificationController.addNotification(interaction.member as GuildMember, voiceChannel, self, after, always, all);

      await interaction.editReply({
        content: '通知設定を追加しました'
      });

      return;
    }

    if (subCommand === 'del') {
      const voiceChannel = options.getChannel('voicechannel') as VoiceChannel;

      await NotificationController.delNotification(interaction.member as GuildMember, voiceChannel);

      await interaction.editReply({
        content: '通知設定を削除しました'
      });

      return;
    }

    if (subCommand === 'list') {

      const settings = (await NotificationController.listNotification(interaction.member as GuildMember))
        .filter(setting => setting.voiceChannel != null && setting.voiceChannel.guild === interaction.guild);

      let msg = '';
      if (settings.length == 0) {
        msg = 'このサーバーで通知を設定しているチャンネルはありません'
      } else {
        msg += `このサーバーで通知を設定しているチャンネルは${settings.length}個あります\n`;
        for (const setting of settings) {
          msg += `${setting.voiceChannel.url}\n`;
        }
      }
      await interaction.editReply({
        content: msg
      });
    }
  }
)