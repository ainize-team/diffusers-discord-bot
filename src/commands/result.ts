import { CommandInteraction, EmbedBuilder } from 'discord.js';
import Command from './commands';
import { getRequest } from '../common/utils';
import envs from '../common/envs';
import { ResponseStatus, ErrorTitle, ErrorMessages, DiscordColors } from '../common/enums';
import { customErrorHandler } from '../common/error';
import { ITextToImageResponse } from '../types';
import { buildTextToImageEmbed } from '../common/discord';

const { ENDPOINT } = envs;

const result = async (interaction: CommandInteraction) => {
  if (!interaction || interaction.user.bot || !interaction.isChatInputCommand() || !interaction.guildId) return;
  try {
    await interaction.deferReply();
    const taskId = interaction.options.getString('task_id')!;
    const imagesResponse = await getRequest(`${ENDPOINT}/tasks/${taskId}/images`);
    if (!imagesResponse.isSuccess) {
      const embed = new EmbedBuilder()
        .setColor(DiscordColors.ERROR)
        .setTitle(ErrorTitle.WRONG_TASK_ID)
        .setDescription(
          `Requested task was not found. Your task id(${taskId}) may be wrong. Please input correct task id.`,
        );
      await interaction.reply({ embeds: [embed] });
      return;
    }
    const images = imagesResponse.data as ITextToImageResponse;
    if (images.status !== ResponseStatus.COMPLETED) {
      const embed = new EmbedBuilder()
        .setColor(DiscordColors.WARNING)
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
        .setColor(DiscordColors.ERROR)
        .setTitle(ErrorTitle.WRONG_TASK_ID)
        .setDescription(
          `Requested task was not found. Your task id(${taskId}) may be wrong. Please input correct task id.`,
        );
      await interaction.reply({ embeds: [embed] });
      return;
    }
    const params = paramsResponse.data;
    const description = `task_id: ${taskId}\n`;
    const title = `Prompt : ${params.prompt}`;

    const { embeds, components } = buildTextToImageEmbed(description, title, taskId, images);
    await interaction.editReply({
      embeds,
      content: `${interaction.user} The result of requested task is below.`,
      components,
    });
  } catch (error) {
    let errorMessage = ErrorMessages.UNKNOWN as string;
    errorMessage += `Error: ${customErrorHandler(error)}`;
    const embed = new EmbedBuilder()
      .setColor(DiscordColors.ERROR)
      .setTitle(ErrorTitle.UNKNOWN)
      .setDescription(errorMessage);
    await interaction.reply({ embeds: [embed] });
  }
};

export const resultCommand = new Command('result', 'Get task result using task id', result);
resultCommand.addStringCommandOption({
  name: 'task_id',
  description: 'Task Id to get task result.',
  isRequired: true,
});
