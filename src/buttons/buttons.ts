import { IButtonExecuteFunc, IDiscordButton } from '../types';

export default class Button {
  public name: string;

  private execute: IButtonExecuteFunc;

  constructor(name: string, execute: IButtonExecuteFunc) {
    this.name = name;
    this.execute = execute;
  }

  getButton(): IDiscordButton {
    return {
      execute: this.execute,
    };
  }
}
