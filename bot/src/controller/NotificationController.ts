import { GuildMember, VoiceChannel } from "discord.js";
import { AppDataSource } from "../data-source";
import { Member } from "../entity/Member";
import { VcNotification } from "../entity/VcNotification";
import { CLIENT } from "..";

export const NotificationController = new class {

  /**
   * 
   * @param target 
   * @param voiceChannel 
   * @param self 
   * @param after 
   * @param always 
   * @param all 
   */
  async addNotification(target: GuildMember, voiceChannel: VoiceChannel, always: boolean, all: boolean) {

    //  トランザクション開始
    await AppDataSource.transaction(async manager => {

      //  ログ
      console.log('通知登録');

      const notification = new VcNotification();
      notification.all = all;
      notification.always = always;
      notification.voiceChannelId = voiceChannel.id;
      notification.member = { userId: target.id };

      await manager.upsert(Member, [{ userId: target.id }], ['userId']);
      await manager.upsert(VcNotification, [notification], ['voiceChannelId', 'member']);
    });
  }

  async delNotification(target: GuildMember, voiceChannel: VoiceChannel) {

    //  ログ
    console.log('通知解除');

    await AppDataSource.transaction(async manager => {
      await manager.delete(VcNotification, {
        voiceChannelId: voiceChannel.id,
        member: {
          userId: target.id
        }
      });
    });
  }

  async listNotification(target: GuildMember) {
    const notifications = await AppDataSource.manager.findBy(VcNotification,
      {
        member: {
          userId: target.id,
        },
      }
    );

    const settings = await Promise.all(notifications.map(async notification => {
      const voiceChannel = await CLIENT.channels.fetch(notification.voiceChannelId) as VoiceChannel;
      return {
        voiceChannel: voiceChannel,
        all: notification.all,
        always: notification.always,
      };
    }));

    return settings.filter(setting => setting.voiceChannel != null);
  }

  async notify(voiceChannel: VoiceChannel, trigger: GuildMember) {
    const settings = await AppDataSource.manager.find(VcNotification, {
      where: {
        voiceChannelId: voiceChannel.id,
      },
      relations: {
        member: true
      }
    });

    //  ログ
    console.log(`${settings.length}個の通知設定があります`);

    await Promise.all(settings.filter(async setting => {
      const member = await voiceChannel.guild.members.fetch(setting.member.userId);
      if (!member) {
        await AppDataSource.manager.delete(VcNotification, member);
        return;
      }

      if (voiceChannel.members.has(member.id) === true) {
        return;
      }

      if (member.presence?.status !== 'online' && setting.always === false) {
        return;
      }

      if (voiceChannel.members.filter(m => !m.user.bot).size > 1 && setting.all === false) {
        return;
      }

      const dm = member.dmChannel ?? await member.createDM();
      await dm.send({
        content: `${voiceChannel.url} に${voiceChannel.members.size}人のメンバーが入室しています`,
      });
    }));
  }
}