import { Awaitable, CommandInteraction, Events, SlashCommandBuilder, SlashCommandSubcommandsOnlyBuilder } from 'discord.js';

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

type CMD = SlashCommandBuilder|SlashCommandSubcommandsOnlyBuilder|Omit<SlashCommandBuilder, 'addSubcommand' | 'addSubcommandGroup'>

/**
 * コマンドハンドラ
 */
export class CommandHandler {
  data: CMD;
  handler: (interaction: CommandInteraction) => Promise<void>;
  constructor(data: CMD, handler: (interaction: CommandInteraction) => Promise<void>) {
    this.data = data;
    this.handler = handler;
  }
}