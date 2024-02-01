import fs from "fs";
import * as dotenv from 'dotenv';
dotenv.config({ path: '../.env' });
import { REST, RESTPostAPIChatInputApplicationCommandsJSONBody, Routes } from "discord.js";
import { CommandHandler } from "./core";
import { exit } from 'process';

const TOKEN = process.env.TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;

if (undefined === TOKEN) {
  console.error('環境変数TOKENがありません');
  exit(1);
}
if (undefined === CLIENT_ID) {
  console.error('環境変数CLIENT_IDがありません');
  exit(1);
}

(async () => {
  const commands: RESTPostAPIChatInputApplicationCommandsJSONBody[] = [];

  const rest = new REST({ version: "10" }).setToken(TOKEN);
  const commandFiles = fs.readdirSync("./commands");

  await Promise.all(commandFiles.map((file) =>
          import(`./commands/${file}`)
              .then(({ handler }: { handler: CommandHandler }) => {
                  commands.push(handler.data.toJSON());
              })
  ));

  console.log(commands);

  await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands })
    .then(() => console.log(`Registered ${commands.length} application commands.`))
    .catch(console.error);
})();
