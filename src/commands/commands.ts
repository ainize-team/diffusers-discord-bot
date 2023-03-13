import { SlashCommandBuilder } from 'discord.js';
import { IDiscordCommand, ICommandExecuteFunc, INumberCommandOption, IStringCommandOption } from '../types';

export default class Command {
  public name: string;

  public description: string;

  private commandBuilder: SlashCommandBuilder;

  private execute: ICommandExecuteFunc;

  constructor(name: string, description: string, execute: ICommandExecuteFunc) {
    this.name = name;
    this.description = description;

    this.commandBuilder = new SlashCommandBuilder().setName(this.name).setDescription(this.description);

    this.execute = execute;
  }

  addStringCommandOption(commandOption: IStringCommandOption) {
    this.commandBuilder.addStringOption((option) => {
      option
        .setName(commandOption.name)
        .setDescription(commandOption.description)
        .setRequired(commandOption.isRequired);
      if (commandOption.choices !== undefined) {
        option.setChoices(...commandOption.choices);
      }
      if (commandOption.maxLength !== undefined) {
        option.setMaxLength(commandOption.maxLength);
      }
      if (commandOption.minLength !== undefined) {
        option.setMinLength(commandOption.minLength);
      }
      return option;
    });
  }

  addIntegerCommandOption(commandOption: INumberCommandOption) {
    this.commandBuilder.addIntegerOption((option) => {
      option
        .setName(commandOption.name)
        .setDescription(commandOption.description)
        .setRequired(commandOption.isRequired);
      if (commandOption.choices !== undefined) {
        option.setChoices(...commandOption.choices);
      }
      if (commandOption.maxValue !== undefined) {
        option.setMaxValue(commandOption.maxValue);
      }
      if (commandOption.minValue !== undefined) {
        option.setMinValue(commandOption.minValue);
      }
      return option;
    });
  }

  addNumberCommandOption(commandOption: INumberCommandOption) {
    this.commandBuilder.addNumberOption((option) => {
      option
        .setName(commandOption.name)
        .setDescription(commandOption.description)
        .setRequired(commandOption.isRequired);
      if (commandOption.choices !== undefined) {
        option.setChoices(...commandOption.choices);
      }
      if (commandOption.maxValue !== undefined) {
        option.setMaxValue(commandOption.maxValue);
      }
      if (commandOption.minValue !== undefined) {
        option.setMinValue(commandOption.minValue);
      }
      return option;
    });
  }

  getCommand(): IDiscordCommand {
    return {
      data: this.commandBuilder,
      execute: this.execute,
    };
  }
}
