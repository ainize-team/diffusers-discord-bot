import { CommandInteraction } from 'discord.js';
import Command from './commands';
import { getHelpText } from '../utils/help';

const help = async (interaction: CommandInteraction) => {
  const helpText = getHelpText();
  await interaction.reply(helpText);
};
export const helpCommand = new Command('help', 'Show help for bot', help);
