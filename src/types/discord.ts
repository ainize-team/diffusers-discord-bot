import { ButtonInteraction, Collection, CommandInteraction, Interaction, SlashCommandBuilder } from 'discord.js';

export interface ICommandExecuteFunc {
  (interaction: CommandInteraction): Promise<unknown>;
}

export interface IButtonExecuteFunc {
  (interaction: ButtonInteraction, options: Array<string>): Promise<unknown>;
}

export interface IExecuteProps {
  interaction: Interaction;
  commands: Collection<string, IDiscordCommand>;
  commandNames: Array<string>;
  buttons: Collection<string, IDiscordButton>;
  buttonNames: Array<string>;
}

export interface IDiscordCommand {
  data: SlashCommandBuilder;
  execute: ICommandExecuteFunc;
}

export interface IDiscordButton {
  execute: IButtonExecuteFunc;
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

export interface INumberCommandOption extends ICommandOption {
  choices?: { name: string; value: number }[];
  maxValue?: number;
  minValue?: number;
}
