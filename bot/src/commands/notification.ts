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
            .setDescription('監視するVoiceChannel')
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
    ),
  async interaction => {
    //  ギルドから実行されているか確認
    if (!(interaction.channel instanceof GuildChannel)) {
      return;
    }

    const options = interaction.options as CommandInteractionOptionResolver;
    const subCommand = options.getSubcommand();

    if (subCommand === 'add') {
      const all = !!options.getBoolean('all');
      const self = !!options.getBoolean('self');
      const always = !!options.getBoolean('always');
      const after = !!options.getBoolean('after');
      const voiceChannel = options.getChannel('voicechannel') as VoiceChannel;

      await NotificationController.addNotification(interaction.member as GuildMember, voiceChannel, self, after, always, all);
    }
  }
)