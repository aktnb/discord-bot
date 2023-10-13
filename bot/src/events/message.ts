import { Events, Message } from "discord.js";
import { EventListener } from "../core";
import { CustomResponseController } from "../controller/CustomResponseController";
import { NgWordController } from '../controller/NgWordController';
import { getZundamonImage } from "../services/zundamon";

export const listener = new EventListener(
  Events.MessageCreate,
  false,
  async (message: Message) => {
    if (!message.guild) {
      return;
    }
    if (message.author.bot) {
      return;
    }

    if (message.content.trimEnd().endsWith("のだ")) {
      const buffer = await getZundamonImage(message.content.trim());
      message.reply({ files: [buffer] });
    } else if (NgWordController.isNgWordContain(message.content)) {
      try {
        const url = await NgWordController.getCatUrl();
        await message.reply({
          content: 'まあ、一旦落ち着こうや。',
          files: [url],
        });
      } catch (e) {
        console.error('cant get cat url');
      }
      return;
    }

    const response = await CustomResponseController.findResponse(message.content, message.guild);
    if (!response || !response.response) {
      return;
    }
    await message.reply(response.response);
  }
)
