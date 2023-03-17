import { ActionRowBuilder, ButtonBuilder, ButtonStyle, CommandInteraction, EmbedBuilder } from 'discord.js';
import Command from './commands';
import { getRequest } from '../common/utils';
import envs from '../common/envs';
import { ResponseStatus, ErrorTitle, WarningMessages, ErrorMessages, DiscordColors } from '../common/enums';
import { customErrorHandler } from '../common/error';
import { ITextToImageResponse } from '../types';

const { ENDPOINT } = envs;

const result = async (interaction: CommandInteraction) => {
  if (!interaction || interaction.user.bot || !interaction.isChatInputCommand() || !interaction.guildId) return;
  try {
    const taskId = interaction.options.getString('task_id');
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
    let description = `task_id: ${taskId}\n`;
    const embed = new EmbedBuilder()
      .setTitle(`Prompt: ${params.prompt}`)
      .setImage(images.result.grid.url)
      .setDescription(description);

    if (images.result.grid.is_filtered) {
      description += `${WarningMessages.NSFW}\n`;
      embed.setColor(DiscordColors.WARNING).setDescription(description);
    } else {
      embed.setColor(DiscordColors.SUCCESS);
    }

    const imageButtons: Array<ButtonBuilder> = [];
    Object.keys(images.result).forEach((key: string) => {
      if (key !== 'grid') {
        imageButtons.push(
          new ButtonBuilder()
            .setCustomId(`singleImage@${taskId}@${key}`)
            .setLabel(`#${key}`)
            .setStyle(ButtonStyle.Secondary),
        );
      }
    });
    const imageRow = new ActionRowBuilder<ButtonBuilder>().addComponents(imageButtons);
    await interaction.reply({
      content: `${interaction.user} The result of requested task is below.`,
      embeds: [embed],
      components: [imageRow],
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
