import { Guild, User } from "discord.js";
import { Response } from "../entity/Response";
import { AppDataSource } from "../data-source";
import { Member } from "../entity/Member";

export const CustomResponseController = new class {

  async addCustomResponse(key: string, response: string, owner: User, guild: Guild) {

    await AppDataSource.transaction(async managaer => {
      const otherResponse = await managaer.findOne(Response, {
        where: {
          key: key,
          guildId: guild.id
        },
        relations: {
          author: true
        }
      });

      if (otherResponse && otherResponse?.author.userId !== owner.id) {
        //  既にキーにカスタムレスポンスが登録されている場合
        throw new Error('duplicated');
      }

      const customResponse = new Response();
      customResponse.author = { userId: owner.id };
      customResponse.guildId = guild.id;
      customResponse.key = key;
      customResponse.response = response;

      await managaer.upsert(Member, [{ userId: owner.id }], ['userId']);
      await managaer.upsert(Response, [customResponse], ['key', 'guildId']);
    });
  }

  async delCustomResponse(key: string, owner: User, guild: Guild) {
    const result = await AppDataSource.manager.delete(Response, {
      key: key,
      author: {
        userId: owner.id
      },
      guildId: guild.id
    });
    return result.affected;
  }

  async getGuildsCustomResponses(guild: Guild) {
    return await AppDataSource.manager.find(Response, {
      where: {
        guildId: guild.id
      },
      relations: {
        author: true
      }
    });
  }

  async findResponse(key: string, guild: Guild) {
    return await AppDataSource.manager.findOne(Response, {
      where: {
        guildId: guild.id,
        key: key
      }
    });
  }
}
