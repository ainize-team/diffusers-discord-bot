import { CommandInteraction, EmbedBuilder, Colors } from 'discord.js';
import Command from './commands';
import { getRequest } from '../common/utils';
import envs from '../common/envs';
import { ResponseStatus, ErrorTitle, WarningMessages, ErrorMessages } from '../common/enums';
import { customErrorHandler } from '../common/error';

const { ENDPOINT } = envs;

const result = async (interaction: CommandInteraction) => {
  if (!interaction || interaction.user.bot || !interaction.isChatInputCommand() || !interaction.guildId) return;
  try {
    const taskId = interaction.options.getString('task_id');
    const imagesResponse = await getRequest(`${ENDPOINT}/tasks/${taskId}/images`);
    if (!imagesResponse.isSuccess) {
      const embed = new EmbedBuilder()
        .setColor(Colors.Red)
        .setTitle(ErrorTitle.WRONG_TASK_ID)
        .setDescription(
          `Requested task was not found. Your task id(${taskId}) may be wrong. Please input correct task id.`,
        );
      await interaction.reply({ embeds: [embed] });
      return;
    }
    const images = imagesResponse.data;
    if (images.status !== ResponseStatus.COMPLETED) {
      const embed = new EmbedBuilder()
        .setColor(Colors.Orange)
        .setTitle('Task is not finished')
        .setDescription(`Current status : ${images.status}`);
      await interaction.reply({
        content: `${interaction.user} The result of requested task is below.`,
        embeds: [embed],
      });
      return;
    }

    const paramsResponse = await getRequest(`${ENDPOINT}/tasks/${taskId}/params`);
    if (!paramsResponse.isSuccess) {
      const embed = new EmbedBuilder()
        .setColor(Colors.Red)
        .setTitle(ErrorTitle.WRONG_TASK_ID)
        .setDescription(
          `Requested task was not found. Your task id(${taskId}) may be wrong. Please input correct task id.`,
        );
      await interaction.reply({ embeds: [embed] });
      return;
    }
    const params = paramsResponse.data;
    const warningMessages = [];
    if (images.result.grid.is_filtered) {
      warningMessages.push(WarningMessages.NSFW);
    }

    let description = `task_id: ${taskId}`;
    let color = Colors.Green as number;
    if (warningMessages.length !== 0) {
      warningMessages.forEach((message) => {
        description += `${message}\n`;
      });
      color = Colors.Orange;
    }
    const embed = new EmbedBuilder()
      .setColor(color)
      .setTitle(`Prompt: ${params.prompt}`)
      .setDescription(description)
      .setImage(images.result.grid.url);

    await interaction.reply({
      content: `${interaction.user} The result of requested task is below.`,
      embeds: [embed],
    });
  } catch (error) {
    let errorMessage = ErrorMessages.UNKNOWN as string;
    errorMessage += `Error: ${customErrorHandler(error)}`;
    const embed = new EmbedBuilder().setColor(Colors.Red).setTitle(ErrorTitle.UNKNOWN).setDescription(errorMessage);
    await interaction.reply({ embeds: [embed] });
  }
};

export const resultCommand = new Command('result', 'Get task result using task id', result);
resultCommand.addStringCommandOption({
  name: 'task_id',
  description: 'Task Id to get task result.',
  isRequired: true,
});
