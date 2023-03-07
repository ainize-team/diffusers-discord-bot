import { CommandInteraction, EmbedBuilder, Colors } from 'discord.js';
import Command from './commands';
import { customErrorHandler } from '../common/error';
import envs from '../common/envs';
import { getRequest } from '../common/utils';
import { ErrorTitle } from '../common/enums';

const { ENDPOINT } = envs;

const getParamsText = async (taskId: string): Promise<string | null> => {
  try {
    const { isSuccess, data } = await getRequest(`${ENDPOINT}/tasks/${taskId}/params`);
    if (!isSuccess) {
      return null;
    }
    let paramsText = '';
    Object.entries(data).forEach(([paramName, paramValue]) => {
      paramsText += `> **${paramName}**\n> ${paramValue}\n`;
    });

    return paramsText;
  } catch (error) {
    const errorMessage = customErrorHandler(error);
    return errorMessage;
  }
};

const params = async (interaction: CommandInteraction) => {
  if (!interaction || interaction.user.bot || !interaction.isChatInputCommand() || !interaction.guildId) return;
  const taskId = interaction.options.getString('task_id') as string;
  const paramsText = await getParamsText(taskId);

  if (!paramsText) {
    const embed = new EmbedBuilder()
      .setColor(Colors.Red)
      .setTitle(ErrorTitle.WRONG_TASK_ID)
      .setDescription(
        `Requested task was not found. Your task id(${taskId}) may be wrong. Please input correct task id.`,
      );
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
