import { GuildMember, VoiceChannel } from "discord.js";
import { prisma } from "../lib/prisma";

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

    await prisma.vc_notification.create({
      data: {
        all: all,
        always: always,
        voiceChannelId: voiceChannel.id,
        member: {
          connectOrCreate: {
            where: {
              userId: target.id,
            },
            create: {
              userId: target.id,
            },
          },
        },
      },
    });

    await prisma.$disconnect();
  }

  async delNotification(target: GuildMember, voiceChannel: VoiceChannel) {

    //  ログ
    console.log('通知解除');

    await prisma.vc_notification.delete({
      where: {
        memberUserId_voiceChannelId: {
          memberUserId: target.id,
          voiceChannelId: voiceChannel.id,
        },
      },
    });

    await prisma.$disconnect();
  }

  async listNotification(target: GuildMember) {

    const notifications = await prisma.vc_notification.findMany({
      where: {
        member: {
          userId: target.id,
        },
      },
    });

    await prisma.$disconnect();

    const { CLIENT } = await import('../index');

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
    try {
      const settings = await prisma.vc_notification.findMany({
        where: {
          voiceChannelId: voiceChannel.id,
        },
      });

      console.log(`${settings.length}個の通知設定があります`);

      await Promise.all(settings.filter(async setting => {
        const member = await voiceChannel.guild.members.fetch(setting.memberUserId);
        if (!member) {
          await prisma.vc_notification.delete({
            where: {
              id: setting.id,
            }
          });
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
    } catch (e) {

    }
  }
}