import { Events, GuildMember, VoiceChannel, VoiceState } from "discord.js";
import { EventListener } from "../core";
import { RoomController } from "../controller/RoomController";

export const listener = new EventListener(
  Events.VoiceStateUpdate,
  false,
  async (before: VoiceState, after: VoiceState) => {
    //  入退室があるか調べる
    if (before.channel == after.channel) {
      //  入退室がない場合
      return;
    }

    const bChannelExist = before.channel instanceof VoiceChannel
    const aChannelExist = after.channel instanceof VoiceChannel

    if (bChannelExist && !aChannelExist && before.member instanceof GuildMember) {
      //  退室のみ
      await RoomController.memberLeave(before.channel, before.member);
      return;
    }

    if (!bChannelExist && aChannelExist && after.member instanceof GuildMember) {
      //  入室のみ
      await RoomController.memberJoin(after.channel, after.member);
      return;
    }

    if (bChannelExist && aChannelExist && after.member instanceof GuildMember) {
      //  チャンネル間の移動
      await RoomController.memberMove(before.channel, after.channel, after.member);
      return;
    }
  }
);
