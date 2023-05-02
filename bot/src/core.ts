import { Awaitable, Events } from 'discord.js';

/**
 * イベントハンドラ
 */
export class EventListener {
  /**
   * イベント名
   */
  eventName: Events;

  /**
   * once or on
   */
  once: boolean;

  /**
   * イベントリスナ関数
   */
  execute: (...args: any[]) => Awaitable<void>;

  /**
   * コンストラクタ
   * @param eventName Event Name
   * @param once Is event type once
   * @param execute Event Handler
   */
  constructor(eventName: Events, once: boolean, execute: (...args: any[]) => Awaitable<void>) {
    this.eventName = eventName;
    this.once = once;
    this.execute = execute;
  }
}
