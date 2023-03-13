import { ButtonInteraction, EmbedBuilder, Colors } from 'discord.js';
import { getRequest } from '../common/utils';
import envs from '../common/envs';
import Button from './buttons';
import { ErrorTitle, WarningMessages } from '../common/enums';

const { ENDPOINT } = envs;

const getSingleImage = async (interaction: ButtonInteraction, options: Array<string>) => {
  const [taskId, imageNo] = options;
  const imagesResponse = await getRequest(`${ENDPOINT}/tasks/${taskId}/images`);
  if (!imagesResponse.isSuccess) {
    const embed = new EmbedBuilder()
      .setColor(Colors.Red)
      .setTitle(ErrorTitle.WRONG_TASK_ID)
      .setDescription(
        `Requested task was not found. Your task id(${taskId}) may be wrong. Please input correct task id.`,
      );
    await interaction.reply({ embeds: [embed] });
  }
  const images = imagesResponse.data;
  const paramsResponse = await getRequest(`${ENDPOINT}/tasks/${taskId}/params`);
  if (!paramsResponse.isSuccess) {
    const embed = new EmbedBuilder()
      .setColor(Colors.Red)
      .setTitle(ErrorTitle.WRONG_TASK_ID)
      .setDescription(
        `Requested task was not found. Your task id(${taskId}) may be wrong. Please input correct task id.`,
      );
    await interaction.reply({ embeds: [embed] });
  }

  const params = paramsResponse.data;

  const warningMessages = [];
  if (images.result.grid.is_filtered) {
    warningMessages.push(WarningMessages.NSFW);
  }

  let description = `task_id: ${taskId}\n`;
  let color = Colors.Green as number;
  if (warningMessages.length !== 0) {
    warningMessages.forEach((message) => {
      description += `${message}\n`;
    });
    color = Colors.Orange;
  }
  const imageURL = images.result[imageNo].is_filtered ? images.result[imageNo].origin_url : images.result[imageNo].url;

  const embed = new EmbedBuilder()
    .setColor(color)
    .setTitle(`Prompt: ${params.prompt}`)
    .setDescription(description)
    .setImage(imageURL);

  await interaction.reply({
    content: `${interaction.user} The result of requested task is below.`,
    embeds: [embed],
    ephemeral: true,
  });
};

export const singleImageButton = new Button('singleImage', getSingleImage);
