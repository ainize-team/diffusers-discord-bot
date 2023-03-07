import { CommandInteraction, EmbedBuilder } from 'discord.js';
import Command from './commands';
import { getParamsText } from '../utils/params';

const params = async (interaction: CommandInteraction) => {
  if (!interaction || interaction.user.bot || !interaction.isChatInputCommand() || !interaction.guildId) return;
  const taskId = interaction.options.getString('task_id') as string;
  const paramsText = await getParamsText(taskId);

  if (!paramsText) {
    const embed = new EmbedBuilder()
      .setTitle('Wrong Task ID Error')
      .setDescription(
        `Requested task was not found. Your task id(${taskId}) may be wrong. Please input correct task id.`,
      )
      .setColor(0xed4245);
    await interaction.reply({ embeds: [embed] });
    return;
  }
  await interaction.reply(paramsText);
};

export const paramsCommand = new Command('params', 'Get task parameters using task id', params);
paramsCommand.addStringCommandOption({
  name: 'task_id',
  description: 'Task Id to get request parameters.',
  isRequired: true,
});
