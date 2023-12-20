import { AttachmentBuilder, Events, Message } from "discord.js";
import { EventListener } from "../core";
import { CustomResponseController } from "../controller/CustomResponseController";
import { NgWordController } from '../controller/NgWordController';
import { getZundaVoice, getZundamonImage } from "../services/zundamon";

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

    const text = message.content.replaceAll(/<@\d{18}>/g, '');
    const result = message.content.match(/のだ[!?\.。？！]*?$/);
    console.log(result);
    if (result) {
      const image = getZundamonImage(text.trim());
      const wav = getZundaVoice(text.trim());
      const reply = await message.reply({ files: [ await image ]});
      await reply.reply({ files: [ new AttachmentBuilder(await wav).setName('voice.wav')] });
    } else if (NgWordController.isNgWordContain(text)) {
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
