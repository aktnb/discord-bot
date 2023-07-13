import { ChannelType, GuildMember, OverwriteResolvable, PermissionsBitField, Role, TextChannel, VoiceChannel } from "discord.js";
import { CLIENT } from "..";
import { prisma } from '../lib/prisma';
import { Prisma } from "@prisma/client";

export const RoomController = new class {

  /**
   * メンバーが入室したときの処理
   * @param voiceChannel
   * @param target
   * @returns
   */
  async memberJoin(voiceChannel: VoiceChannel, target: GuildMember) {
    //  メンバーがBotか調べる
    if (target.user.bot) {
      //  Botの場合、アーリーリターン
      return;
    }

    //  入室先がAFKチャンネルか調べる
    if (voiceChannel == voiceChannel.guild.afkChannel) {
      //  入室先がAFKチャンネルの場合、アーリーリターン
      console.log(`${target.displayName}がAFKチャンネルに入室`);
      return;
    }

    //  トランザクション開始
    await prisma.$transaction(async tx => {
      const member = await tx.member.upsert({
        where: {
          userId: target.id,
        },
        create: {
          userId: target.id,
          private_channel: {
            connectOrCreate: {
              where: {
                voiceChannelId: voiceChannel.id,
              },
              create: {
                voiceChannelId: voiceChannel.id,
              },
            },
          },
        },
        update: {
          private_channel: {
            connectOrCreate: {
              where: {
                voiceChannelId: voiceChannel.id,
              },
              create: {
                voiceChannelId: voiceChannel.id,
              }
            }
          }
        },
        include: {
          private_channel: true,
        },
      });

      if (member == null || member.private_channel == null ) {
        throw new Error('DB Error');
      }

      const textChannel = await this.findOrCreateTextChannel(member.private_channel.textChannelId, voiceChannel);
      const role = await this.findOrCreateRole(member.private_channel.roleId, voiceChannel);

      await target.roles.add(role);

      //  TextChannelの権限を編集
      await textChannel.permissionOverwrites.edit(role, {
        ReadMessageHistory: true,
        ViewChannel: true,
        SendMessages: true
      });

      await tx.private_channel.update({
        where: {
          voiceChannelId: voiceChannel.id,
        },
        data: {
          textChannelId: textChannel.id,
          roleId: role.id,
        },
      });
    }, {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
    });

    await prisma.$disconnect();
  }

  /**
   * メンバーが退室したときの処理
   * @param voiceChannel
   * @param target
   * @returns
   */
  async memberLeave(voiceChannel: VoiceChannel, target: GuildMember) {
    //  メンバーがBotか調べる
    if (target.user.bot) {
      //  Botの場合、アーリーリターン
      return;
    }

    //  退室元がAFKチャンネルか調べる
    if (voiceChannel == voiceChannel.guild.afkChannel) {
      //  退室元がAFKチャンネルの場合、アーリーリターン
      return;
    }

    await prisma.$transaction(async tx => {
      const member = await tx.member.findUnique({
        where: {
          userId: target.id,
        },
        include: {
          private_channel: true,
        }
      });

      if (member == null || member.private_channel == null) {
        return;
      }

      const role = await this.findRole(member.private_channel.roleId, voiceChannel);

      if (role) {
        await target.roles.remove(role);
      } else {
        console.log('No Role');
        await tx.private_channel.update({
          where: {
            voiceChannelId: voiceChannel.id,
          },
          data: {
            roleId: null,
          },
        });
      }

      //  ボイスチャンネルが0人になるか調べる
      if (voiceChannel.members.every(m => m.user.bot || m == target)) {

        //  0人になる場合、TextChannelとRoleを削除
        const textChannel = await this.findTextChannel(member.private_channel.textChannelId, voiceChannel);

        await textChannel?.delete();
        await role?.delete();

        await tx.private_channel.update({
          where: {
            voiceChannelId: voiceChannel.id,
          },
          data: {
            textChannelId: null,
            roleId: null,
          },
        });
      }

      await tx.member.update({
        where: {
          userId: target.id,
        },
        data: {
          privateChannelVoiceChannelId: null
        },
      });
    }, {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
    });

    await prisma.$disconnect();
  }

  /**
   * テキストチャンネルIDからテキストチャンネルを探し、ない場合は新しく作成する
   * @param textChannelId
   * @param voiceChannel
   * @returns
   */
  async findOrCreateTextChannel(textChannelId: string| undefined | null, voiceChannel: VoiceChannel): Promise<TextChannel> {
    if (textChannelId == undefined) {
      return await this.createTextChannel(voiceChannel);
    }

    const channels = await voiceChannel.guild.channels.fetch();
    if (channels.has(textChannelId)) {
      return <TextChannel>await CLIENT.channels.fetch(textChannelId);
    } else {
      return await this.createTextChannel(voiceChannel);
    }
  }

  /**
   * テキストチャンネルIDからテキストチャンネルを探す
   * @param textChannelId
   * @param voiceChannel
   * @returns
   */
  async findTextChannel(textChannelId: string | undefined | null, voiceChannel: VoiceChannel): Promise<TextChannel | null> {
    if (textChannelId == undefined) {
      return null;
    }
    try {
      return <TextChannel|null>await voiceChannel.guild.channels.fetch(textChannelId);
    } catch {
      return null;
    }
  }

  /**
   * テキストチャンネルを作成する
   * @param voiceChannel
   * @returns
   */
  async createTextChannel(voiceChannel: VoiceChannel): Promise<TextChannel> {
    const permissionOverwrites: Array<OverwriteResolvable> = new Array<OverwriteResolvable>({
      id: voiceChannel.guild.roles.everyone,
      deny: [
        PermissionsBitField.Flags.ReadMessageHistory,
        PermissionsBitField.Flags.ViewChannel,
        PermissionsBitField.Flags.SendMessages
      ]
    });

    const guildMembers = await voiceChannel.guild.members.fetch();
    guildMembers.filter((member, id) => member.user.bot)
      .forEach((bot, id) => permissionOverwrites.push({
        id: bot,
        allow: [ PermissionsBitField.Default ]
      }));

    return voiceChannel.guild.channels.create({
      name: `${voiceChannel.name}専用TextChannel`,
      type: ChannelType.GuildText,
      permissionOverwrites: permissionOverwrites,
      parent: voiceChannel.parent,
      position: voiceChannel.position
    });
  }

  /**
   * ロールIDからロールを探し、ない場合は新しく作成する
   * @param roleId
   * @param voiceChannel
   * @returns
   */
  async findOrCreateRole(roleId: string | undefined | null, voiceChannel: VoiceChannel): Promise<Role> {
    if (roleId == undefined) {
      return await this.createRole(voiceChannel);
    }

    const roles = await voiceChannel.guild.roles.fetch();
    if (roles.has(roleId)) {
      return <Role>await voiceChannel.guild.roles.fetch(roleId);
    } else {
      return await this.createRole(voiceChannel);
    }
  }

  /**
   * ロールIDからロールを探す
   * @param roleId
   * @param voiceChannel
   * @returns
   */
  async findRole(roleId: string | undefined | null, voiceChannel: VoiceChannel): Promise<Role | null> {
    if (roleId == undefined) {
      return null;
    }

    try {
      return await voiceChannel.guild.roles.fetch(roleId);
    } catch {
      return null;
    }
  }

  /**
   * ロールを作成する
   * @param voiceChannel
   * @returns
   */
  async createRole(voiceChannel: VoiceChannel): Promise<Role> {
    return await voiceChannel.guild.roles.create({
      name: `${voiceChannel.name} member`,
      reason: `${voiceChannel.name} member`
    });
  }

  /**
   * 全ボイスチャンネルの入退室状況とPrivateChannelを同期する
   */
  async checkAll(): Promise<void> {
    const guilds = await CLIENT.guilds.fetch();
    for (const [_id, oA2guild] of guilds) {
      const guild = await oA2guild.fetch();
      console.log(`${guild.name}の全VoiceChannelをチェック中...`);
      const channels = await guild.channels.fetch();
      const voiceChannels = channels.filter(ch => ch instanceof VoiceChannel);
      for (const [_vId, voiceChannel] of voiceChannels) {
        if (!voiceChannel) {
          continue;
        }
        await this.checkVoiceChannel(<VoiceChannel>voiceChannel);
      }
    }
  }

  /**
   * ボイスチャンネルの入退室状況とPrivateChannelを同期する
   * @param voiceChannel
   */
  async checkVoiceChannel(voiceChannel: VoiceChannel): Promise<void> {
    //  退室チェック
    console.log(`  ${voiceChannel.name}をチェック中...`)

    const members = await prisma.member.findMany({
      where: {
        private_channel: {
          voiceChannelId: voiceChannel.id,
        },
      },
    });

    for (const member of members) {
      if (!voiceChannel.members.has(member.userId)) {
        //  退室していた場合
        const target = await voiceChannel.guild.members.fetch(member.userId);
        await this.memberLeave(voiceChannel, target);
      }
    }

    //  入室チェック
    for (const [_id, target] of voiceChannel.members.filter(m => !m.user.bot)) {
      await this.memberJoin(voiceChannel, target);
    }
    await prisma.$disconnect();
  }
}
