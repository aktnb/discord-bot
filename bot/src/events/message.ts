import { Events, Message } from "discord.js";
import { EventListener } from "../core";
import { CustomResponseController } from "../controller/CustomResponseController";

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

    const response = await CustomResponseController.findResponse(message.content, message.guild);
    if (!response || !response.response) {
      return;
    }
    await message.reply(response.response);
  }
)