import fs from 'fs';
import * as dotenv from 'dotenv';
dotenv.config({ path: '../.env' });
import { Client, Collection, CommandInteraction, GatewayIntentBits, User } from "discord.js";
import { CommandHandler, EventListener } from './core';
import "reflect-metadata";

const TOKEN = process.env.TOKEN;

/**
 * CLIENT
 */
export const CLIENT = new Client(
  {
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildVoiceStates,
      GatewayIntentBits.GuildMembers,
      GatewayIntentBits.GuildPresences,
      GatewayIntentBits.MessageContent,
      GatewayIntentBits.GuildMessages,
    ]
  }
);

/**
 * すべてのイベントを読み込み、登録する
 * @returns 登録したイベントの数
 */
async function addEventListener(): Promise<number> {
  //  ./eventsディレクトリ下にあるファイルのファイル名を取得
  const eventFiles = fs.readdirSync('./events');

  //  各イベントリスナ定義ファイルに処理を実行する
  await Promise.all(eventFiles.map(async f => {
    //  イベントリスナを読み込む
    const { listener }: { listener: EventListener} = await import(`./events/${f}`);

    //  イベントタイプを調べる
    if (listener.once) {
      //  初回だけ実行する場合
      CLIENT.once((listener.eventName as string), (...args) => listener.execute(...args));
    } else {
      //  常に実行する場合
      CLIENT.on((listener.eventName as string), (...args) => listener.execute(...args));
    }
  }));

  /**
   * 登録したイベント数を返す
   */
  return eventFiles.length;
}


/**
 * すべてのコマンドを読み込む
 * @returns 読み込んだコマンドの数
 */
async function addCommandHandler(): Promise<number> {
  const handlers = new Collection<string, CommandHandler>();

  //  ./commandディレクトリ下にあるファイルのファイル名を取得
  const commandFiles = fs.readdirSync('./commands');

  //  各コマンドハンドラ定義ファイルに処理を実行する
  await Promise.all(commandFiles.map(async f => {
    //  コマンドハンドラを読み込む
    const { handler }: { handler: CommandHandler } = await import(`./commands/${f}`);

    //  コマンドを記録
    handlers.set(handler.data.name, handler);
  }));

  //  コマンドハンドラを登録する
  CLIENT.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) {
      return;
    }

    if (interaction.user.bot) {
      return;
    }

    //  ハンドラを読み込む
    const handler = handlers.get(interaction.commandName);

    if (!handler) {
      return;
    }

    try {
      //  ハンドラ呼び出し
      await handler.handler(<CommandInteraction>interaction);
    } catch (err) {
      console.error(err);
      await interaction.reply({
        content: 'There was an error while executing this command!',
        ephemeral: true,
      });
    }

  });

  return handlers.size;
}


/**
 * エントリポイント
 * @returns
 */
async function main() {
  //  TOKENが設定されているか調べる
  if (!TOKEN) {
    //  TOKENが設定されていない場合
    console.log('環境変数 TOKEN を設定してください');
    return;
  }

  //  DBに接続
  // await AppDataSource.initialize();

  //  イベントを読み込む
  const events_num = await addEventListener();
  console.log(`${events_num}個のイベントを読み込みました`);

  //  コマンドを読み込む
  const commands_num = await addCommandHandler();
  console.log(`${commands_num}個のコマンドを読み込みました`);

  //  ログイン
  console.log('Discord Botを起動します');
  CLIENT.login(TOKEN);
}

/**
 * 起動
 */
main();
