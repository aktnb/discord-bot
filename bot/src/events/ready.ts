import { Client, Events } from "discord.js";
import { EventListener } from "../core";
import { RoomController } from "../controller/RoomController";

export const listener = new EventListener(
  Events.ClientReady,
  true,
  async (client: Client) => {
    console.log(`Ready! Logged in as ${client.user?.tag}`);
    await RoomController.checkAll();
  }
);
