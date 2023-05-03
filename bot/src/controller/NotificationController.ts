import { GuildMember, VoiceChannel } from "discord.js";
import { AppDataSource } from "../data-source";
import { Member } from "../entity/Member";
import { VcNotification } from "../entity/VcNotification";

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
  async addNotification(target: GuildMember, voiceChannel: VoiceChannel, self: boolean, after: boolean, always: boolean, all: boolean) {

    //  トランザクション開始
    await AppDataSource.transaction(async manager => {

      //  ログ
      console.log('通知登録');

      const notification = new VcNotification();
      notification.afterJoin = after;
      notification.all = all;
      notification.self = self;
      notification.always = always;
      notification.voiceChannelId = voiceChannel.id;
      notification.member = { userId: target.id };

      await manager.upsert(Member, [{ userId: target.id }], ['userId']);
      await manager.upsert(VcNotification, [notification], ['voiceChannelId', 'member']);
    });
  }
}