import { ChannelType, Guild, GuildMember, OverwriteResolvable, PermissionsBitField, Role, TextChannel, VoiceChannel } from "discord.js";
import { AppDataSource } from "../data-source";
import { PrivateChannel } from "../entity/PrivateChannel";
import { Member } from "../entity/Member";
import { CLIENT } from "..";
import { EntityManager } from "typeorm";

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

    //  ログ
    console.log(`入室処理`);
    console.log(`member: ${target.displayName}`);
    console.log(`voiceChannel(guild): ${voiceChannel.name}(${voiceChannel.guild.name})`);

    //  対応するPrivateChannelがDB上に存在するか
    const isPrivateChannelExist = await AppDataSource.getRepository(PrivateChannel).findOneBy({
      voiceChannelId: voiceChannel.id
    }) != null;
    //  対応するMemberがDB上に存在するか
    const isMemberExist = await AppDataSource.getRepository(Member).findOneBy({
      userId: target.id,
    }) != null;

    if (!isPrivateChannelExist) {
      //  PrivateChannelがDBにない場合
      try {
        //  新しくPrivateChannelを作成
        console.log('新しいPrivateChannelをDBに記録');
        const privateChannel = new PrivateChannel();
        privateChannel.voiceChannelId = voiceChannel.id;
        await AppDataSource.manager.save(privateChannel);
      } catch (e) {
        console.error(e);
        console.log('Error on creating private channel');
      }
    }

    if (!isMemberExist) {
      //  MemberがDBにない場合
      try {
        //  新しくMemberを作成;
        console.log('新しいMemberをDBに記録');
        const member = new Member();
        member.userId = target.id;
        await AppDataSource.manager.save(member);
      } catch (e) {
        console.error(e);
        console.log('Error on creating member');
      }
    }

    //  トランザクション開始
    await AppDataSource.transaction(async manager => {
      await this.joinTransaction(manager, voiceChannel, target);
    });
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

    //  トランザクション開始
    await AppDataSource.transaction(async manager => {
      await this.leaveTransaction(manager, voiceChannel, target);
    });
  }

  /**
   * メンバーが部屋を移動したときの処理
   * @param beforeChannel
   * @param afterChannel
   * @param target
   */
  async memberMove(beforeChannel: VoiceChannel, afterChannel: VoiceChannel, target: GuildMember) {
    //  メンバーがBotか調べる
    if (target.user.bot) {
      //  Botの場合、アーリーリターン
      return;
    }

    //  トランザクション実行
    await AppDataSource.transaction(async manager => {

      //  退室元がAFKチャンネルか調べる
      if (beforeChannel != beforeChannel.guild.afkChannel) {
        //  通常チャンネルの場合、退室処理
        await this.leaveTransaction(manager, beforeChannel, target);
      } else {
        //  AFKチャンネルの場合
        console.log(`${target.displayName}がAFKチャンネルから退室`);
      }

      //  入室先がAFKチャンネルか調べる
      if (afterChannel == afterChannel.guild.afkChannel) {
        //  AFKチャンネルの場合、アーリーリターン
        console.log(`${target.displayName}がAFKチャンネルに入室`);
        return;
      }

      //  対応するPrivateChannelがDB上に存在するか
      const isPrivateChannelExist = await AppDataSource.getRepository(PrivateChannel).findOneBy({
        voiceChannelId: afterChannel.id
      }) != null;
      //  対応するMemberがDB上に存在するか
      const isMemberExist = await AppDataSource.getRepository(Member).findOneBy({
        userId: target.id,
      }) != null;

      if (!isPrivateChannelExist) {
        //  PrivateChannelがDBにない場合
        try {
          //  新しくPrivateChannelを作成
          console.log('Create New PrivateChannel');
          const privateChannel = new PrivateChannel();
          privateChannel.voiceChannelId = afterChannel.id;
          await AppDataSource.manager.save(privateChannel);
        } catch (e) {
          console.error(e)
          console.log('Error on creating private channel');
        }
      }

      if (!isMemberExist) {
        //  MemberがDBにない場合
        try {
          //  新しくMemberを作成
          console.log('Create New Member');
          const member = new Member();
          member.userId = target.id;
          await AppDataSource.manager.save(member);
        } catch {
          console.log('Error on creating member');
        }
      }

      //  入室処理
      await this.joinTransaction(manager, afterChannel, target);
    });
  }

  /**
   * 入室
   * @param manager
   * @param voiceChannel
   * @param target
   * @returns
   */
  async joinTransaction(manager: EntityManager, voiceChannel: VoiceChannel, target: GuildMember): Promise<void> {
    //  PrivateChannelを専有ロックで取得
    const privateChannel = await manager.findOne(PrivateChannel, {
      where: {
        voiceChannelId: voiceChannel.id,
      },
      lock: {
        mode: 'pessimistic_write'
      }
    });

    //  Memberを専有ロックで取得
    const member = await manager.findOne(Member, {
      where: {
        userId: target.id,
      },
      lock: {
        mode: 'pessimistic_write'
      }
    });

    if (privateChannel == null || member == null) {
      return;
    }

    //  対応するTextChannelを用意
    const textChannel = await this.findOrCreateTextChannel(privateChannel.textChannelId, voiceChannel);
    //  対応するRoleを用意
    const role = await this.findOrCreateRole(privateChannel.roleId, voiceChannel);

    //  PrivateChannelエンティティのカラムを変更
    privateChannel.textChannelId = textChannel.id;
    privateChannel.roleId = role.id;
    member.privateChannel = privateChannel;

    //  DBの変更を保存
    await manager.save([privateChannel, member]);

    //  TextChannelの権限を編集
    await textChannel.permissionOverwrites.edit(role, {
      ReadMessageHistory: true,
      ViewChannel: true,
      SendMessages: true
    });
  }

  /**
   * 退出処理
   * @param manager
   * @param voiceChannel
   * @param target
   * @returns
   */
  async leaveTransaction(manager: EntityManager, voiceChannel: VoiceChannel, target: GuildMember): Promise<void> {
    //  PrivateChannelを専有ロックで取得
    const privateChannel = await manager.findOne(PrivateChannel, {
      where: {
        voiceChannelId: voiceChannel.id,
      },
      lock: {
        mode: 'pessimistic_write'
      }
    });
    //  Memberを専有ロックで取得
    const member = await manager.findOne(Member, {
      where: { 
        userId: target.id,
      },
      lock: {
        mode: 'pessimistic_write'
      }
    });

    if (privateChannel == null || member == null) {
      return;
    }

    member.privateChannel = null;

    //  ボイスチャンネルが0人になるか調べる
    if (voiceChannel.members.filter(m => !m.user.bot && m != target).size == 0) {
      //  0人になる場合、TextChannelとRoleを削除
      const textChannel = await this.findTextChannel(privateChannel.textChannelId, voiceChannel);
      const role = await this.findRole(privateChannel.roleId, voiceChannel);

      await textChannel?.delete();
      await role?.delete();

      privateChannel.textChannelId = null;
      privateChannel.roleId = null;
    }

    //  DBを更新
    await manager.save([privateChannel, member]);
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

    return <TextChannel | null>await voiceChannel.guild.channels.fetch(textChannelId);
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

    return await voiceChannel.guild.roles.fetch(roleId);
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
    const members = await AppDataSource.manager.find(Member, {
      where: {
        privateChannel: {
          voiceChannelId: voiceChannel.id
        }
      }
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
  }
}
