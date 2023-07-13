import { Guild, User } from "discord.js";
import { PrismaClient } from '@prisma/client';

export const CustomResponseController = new class {

  async addCustomResponse(key: string, response: string, owner: User, guild: Guild) {

    const prisma = new PrismaClient();

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
    });

    await prisma.$disconnect();
  }

  async delCustomResponse(key: string, owner: User, guild: Guild) {

    const prisma = new PrismaClient();
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
    await prisma.$disconnect();
  }

  async getGuildsCustomResponses(guild: Guild) {
    const prisma = new PrismaClient();

    const crs = await prisma.response.findMany({
      where: {
        guildId: guild.id,
      },
    });

    await prisma.$disconnect();
    return crs;
  }

  async findResponse(key: string, guild: Guild) {
    const prisma = new PrismaClient();

    const res = prisma.response.findUnique({
      where: {
        key_guildId: {
          key: key,
          guildId: guild.id,
        },
      },
    });

    await prisma.$disconnect();

    return res;
  }
}
