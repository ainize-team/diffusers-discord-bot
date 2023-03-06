import { Collection, CommandInteraction } from 'discord.js';

import { SlashCommandBuilder } from '@discordjs/builders';

export type IExecuteFunc = (interaction: CommandInteraction) => Promise<unknown>;

export interface IExecuteProps {
  interaction: CommandInteraction;
  commands: Collection<string, IDiscordCommand>;
  commandNames: Array<string>;
}

export interface IDiscordCommand {
  data: SlashCommandBuilder;
  execute: IExecuteFunc;
}
