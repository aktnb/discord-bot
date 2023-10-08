import { Guild, User } from "discord.js";
import { prisma } from '../lib/prisma';
import { Prisma } from "@prisma/client";

export const CustomResponseController = new class {

  async addCustomResponse(key: string, response: string, owner: User, guild: Guild) {

    await prisma.$transaction(async tx => {

      const other = await tx.response.findUnique({
        where: {
          key_guildId: {
            key: key,
            guildId: guild.id,
          },
          member: {
            userId: { not: owner.id },
          }
        },
      });

      //  既にキーが使われている場合
      if (other) {
        throw new Error('duplicated');
      }

      await tx.response.upsert({
        where: {
          key_guildId: {
            key: key,
            guildId: guild.id,
          },
          member: {
            userId: owner.id,
          },
        },
        create: {
          key: key,
          guildId: guild.id,
          response: response,
          member: {
            connectOrCreate: {
              create: {
                userId: owner.id,
              },
              where: {
                userId: owner.id,
              },
            },
          },
        },
        update: {
          response: response,
        },
      });
    }, {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
    });

    await prisma.$disconnect();
  }

  async delCustomResponse(key: string, owner: User, guild: Guild) {

    await prisma.response.delete({
      where: {
        key_guildId: {
          key: key,
          guildId: guild.id,
        },
        member: {
          userId: owner.id,
        },
      },
    });
  }

  async getGuildsCustomResponses(guild: Guild) {

    const crs = await prisma.response.findMany({
      where: {
        guildId: guild.id,
      },
    });

    return crs;
  }

  async findResponse(key: string, guild: Guild) {

    const res = prisma.response.findUnique({
      where: {
        key_guildId: {
          key: key,
          guildId: guild.id,
        },
      },
    });

    return res;
  }
}
