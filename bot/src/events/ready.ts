import { Client, Events } from "discord.js";
import { EventListener } from "../core";

export const listener = new EventListener(
  Events.ClientReady,
  true,
  async (client: Client) => {
    console.log(`Ready! Logged in as ${client.user?.tag}`);
  }
);
