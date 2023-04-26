import fs from 'fs';
import { Client } from "discord.js";
import { EventListener } from './core';
import { TOKEN } from './config.json';
import "reflect-metadata";
import { AppDataSource } from './data-source';

/**
 * CLIENT
 */
export const CLIENT = new Client({ intents:[] });

/**
 * すべてのイベントハンドラを登録する
 * @returns 登録したイベントハンドラの数
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
  await AppDataSource.initialize();

  //  イベントを登録する
  const events_num = await addEventListener();
  console.log(`${events_num}個のイベントを登録しました`);

  //  ログイン
  console.log('Discord Botを起動します');
  CLIENT.login(TOKEN);
}

/**
 * 起動
 */
main();
