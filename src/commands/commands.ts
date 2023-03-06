import { SlashCommandBuilder } from '@discordjs/builders';
import { IDiscordCommand, IExecuteFunc } from '../types/discord';

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

  addCommandOption(
    type: string,
    name: string,
    description: string,
    choices: { name: string; value: string }[],
    isRequired = false,
  ) {
    switch (type) {
      case 'string':
        this.commandBuilder.addStringOption((_option) => {
          const option = _option.setName(name).setDescription(description).setRequired(isRequired);
          if (choices.length > 0) {
            option.addChoices(...choices);
          }
          return option;
        });
        break;
      default:
        break;
    }
  }

  getCommand(): IDiscordCommand {
    return {
      data: this.commandBuilder,
      execute: this.execute,
    };
  }
}
