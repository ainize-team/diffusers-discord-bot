import { SlashCommandBuilder } from '@discordjs/builders';
import { IDiscordCommand, IExecuteFunc, IIntegerCommandOption, IStringCommandOption } from '../types';

export default class Command {
  public name: string;

  public description: string;

  private commandBuilder: SlashCommandBuilder;

  private execute: IExecuteFunc;

  constructor(name: string, description: string, execute: IExecuteFunc) {
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
      if (commandOption.choices) {
        option.setChoices(...commandOption.choices);
      }
      if (commandOption.maxLength) {
        option.setMaxLength(commandOption.maxLength);
      }
      if (commandOption.minLength) {
        option.setMinLength(commandOption.minLength);
      }
      return option;
    });
  }

  addIntegerCommandOption(commandOption: IIntegerCommandOption) {
    this.commandBuilder.addIntegerOption((option) => {
      option
        .setName(commandOption.name)
        .setDescription(commandOption.description)
        .setRequired(commandOption.isRequired);
      if (commandOption.choices) {
        option.setChoices(...commandOption.choices);
      }
      if (commandOption.maxValue) {
        option.setMaxValue(commandOption.maxValue);
      }
      if (commandOption.minValue) {
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
