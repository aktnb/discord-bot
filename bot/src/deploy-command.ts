import fs from "fs";
import { TOKEN, CLIENT_ID } from "./config.json";
import { REST, RESTPostAPIChatInputApplicationCommandsJSONBody, Routes } from "discord.js";
import { CommandHandler } from "./core";

(async () => {
  const commands: RESTPostAPIChatInputApplicationCommandsJSONBody[] = [];

  const rest = new REST({ version: "10" }).setToken(TOKEN);
  const commandFiles = fs.readdirSync("./commands");

  // await Promise.all(commandFiles.map(async f => {
  //   const { handler }: { handler: CommandHandler } = await import(`./commands/${f}`);
  //   commands.push(handler.command.toJSON());
  // }));

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