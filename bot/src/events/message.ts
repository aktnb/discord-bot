import { AttachmentBuilder, Events, Message } from "discord.js";
import { EventListener } from "../core";
import { CustomResponseController } from "../controller/CustomResponseController";
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
    }

    const response = await CustomResponseController.findResponse(message.content, message.guild);
    if (!response || !response.response) {
      return;
    }
    await message.reply(response.response);
  }
)
