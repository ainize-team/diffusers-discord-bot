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

export interface ICommandOption {
  name: string;
  description: string;
  isRequired: boolean;
}
export interface IStringCommandOption extends ICommandOption {
  choices?: { name: string; value: string }[];
  maxLength?: number;
  minLength?: number;
}

export interface IIntegerCommandOption extends ICommandOption {
  choices?: { name: string; value: number }[];
  maxValue?: number;
  minValue?: number;
}
