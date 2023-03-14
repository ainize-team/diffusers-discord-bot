import { ButtonInteraction, EmbedBuilder, Colors } from 'discord.js';
import { getRequest, postRequest } from '../common/utils';
import envs from '../common/envs';
import Button from './buttons';
import { ErrorTitle, ResponseStatus } from '../common/enums';

const { ENDPOINT, UPSCALE_ENDPOINT } = envs;

const waitForStatusChange = async (prevStatus: ResponseStatus, taskId: string, timeout = 300000) => {
  let intervalId: any;
  const timeoutPromise = new Promise((resolve, reject) => {
    setTimeout(() => {
      clearInterval(intervalId);
      reject(new Error('Timeout'));
    }, timeout);
  });
  const statusPromise = new Promise((resolve, reject) => {
    intervalId = setInterval(async () => {
      const res = await getRequest(`${UPSCALE_ENDPOINT}/result/${taskId}`);
      if (!res.isSuccess) {
        reject(new Error('Error'));
      }
      if (res.data.status !== prevStatus) {
        clearInterval(intervalId);
        resolve(res.data);
      }
    }, 1000);
  });
  return Promise.race([timeoutPromise, statusPromise]);
};

const upscale = async (interaction: ButtonInteraction, options: Array<string>) => {
  interaction.deferReply({ ephemeral: true });
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
  const imageURL = images.result[imageNo].is_filtered ? images.result[imageNo].origin_url : images.result[imageNo].url;
  const res = await postRequest(`${UPSCALE_ENDPOINT}/upscale/url?url=${imageURL}`, {});
  if (!res.isSuccess) {
    interaction.editReply('Failed To Request');
    return;
  }
  const upscaleTaskId = res.data.task_id;
  const user = interaction.user.toString();
  const messageEmbed = new EmbedBuilder()
    .setColor(Colors.Green)
    .setTitle(`Upscale > Prompt: ${params.prompt}`)
    .setDescription(`Task Id : ${upscaleTaskId}`);
  await interaction.editReply({ embeds: [messageEmbed], content: `${user} Your task is successfully requested.` });
  // PENDING -> ASSIGNED
  let result = (await waitForStatusChange(ResponseStatus.PENDING, upscaleTaskId)) as {
    status: string;
    updated_at: number;
    output: any;
  };
  await interaction.editReply({
    embeds: [messageEmbed],
    content: `${user} Your task's status is updated from ${ResponseStatus.PENDING} to ${ResponseStatus.ASSIGNED}`,
  });
  // ASSIGNED -> COMPLETED
  if (result.status === ResponseStatus.ASSIGNED) {
    result = (await waitForStatusChange(ResponseStatus.ASSIGNED, upscaleTaskId)) as {
      status: string;
      updated_at: number;
      output: any;
    };
  }
  messageEmbed.setImage(result.output);
  await interaction.editReply({
    embeds: [messageEmbed],
    content: `${user} Your task's status is updated from ${ResponseStatus.ASSIGNED} to ${ResponseStatus.COMPLETED}`,
  });
};

export const upscaleButton = new Button('upscale', upscale);
