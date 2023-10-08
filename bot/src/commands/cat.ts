import { SlashCommandBuilder } from "discord.js";
import { CommandHandler } from "../core";

export const handler = new CommandHandler(
    //  1 コマンドの形を定義
    new SlashCommandBuilder()
        .setName('cat')
        .setDescription('response with cat image'),

    //  2 コマンドが実行されたときの処理
    async (interaction) => {
        if (interaction.user.bot) {
            return;
        }
        await interaction.deferReply();

        const response = await fetch('https://api.thecatapi.com/v1/images/search');
        if (!response.ok) {
            //  APIからのレスポンスがOK以外
            console.log('cat error');
            await interaction.reply({
                content: 'Cant'
            });
        }
        //  APIからのレスポンスがOKなら
        const json = await response.json();
        const catData = json[0];

        await interaction.editReply({
            files: [catData['url']]
        });
    }
);
