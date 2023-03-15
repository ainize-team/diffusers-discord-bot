import { ButtonInteraction, EmbedBuilder, Colors, ButtonBuilder, ActionRowBuilder, ButtonStyle } from 'discord.js';
import { getRequest, randomUInt32, postRequest } from '../common/utils';
import envs from '../common/envs';
import { ResponseStatus, WarningMessages } from '../common/enums';
import Button from './buttons';

import { NODE_ENVS } from '../common/constants';
import { ITextToImageResponse } from '../types/diffusers';

const { ENDPOINT, NODE_ENV } = envs;

const waitForStatusChange = async (prevStatus: ResponseStatus, taskId: string, timeout = 300000) => {
  let intervalId: NodeJS.Timer;
  const timeoutPromise = new Promise((resolve, reject) => {
    setTimeout(() => {
      clearInterval(intervalId);
      reject(new Error('Timeout'));
    }, timeout);
  });
  const statusPromise = new Promise((resolve, reject) => {
    intervalId = setInterval(async () => {
      const res = await getRequest(`${ENDPOINT}/tasks/${taskId}/images`);
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

const waitForTxStatusChange = async (taskId: string, timeout = 300000) => {
  let intervalId: NodeJS.Timer;
  const timeoutPromise = new Promise((resolve, reject) => {
    setTimeout(() => {
      clearInterval(intervalId);
      reject(new Error('Timeout'));
    }, timeout);
  });
  const statusPromise = new Promise((resolve, reject) => {
    intervalId = setInterval(async () => {
      const res = await getRequest(`${ENDPOINT}/tasks/${taskId}/tx-hash`);
      if (!res.isSuccess) {
        reject(new Error('Error'));
      }
      if (res.data.status === ResponseStatus.COMPLETED && ResponseStatus.COMPLETED in res.data.tx_hash) {
        clearInterval(intervalId);
        resolve(res.data);
      }
    }, 1000);
  });
  return Promise.race([timeoutPromise, statusPromise]);
};

const regenerate = async (interaction: ButtonInteraction, options: Array<string>) => {
  await interaction.deferReply();
  const [prevTaskId] = options;
  const { isSuccess, data: params } = await getRequest(`${ENDPOINT}/tasks/${prevTaskId}/params`);
  if (!isSuccess) {
    interaction.editReply('Error');
    return;
  }
  const discord = {
    // TODO(@byeongal) update api server [ remove ]
    user_id: 'string',
    guild_id: 'string',
    channel_id: 'string',
    message_id: 'string',
  };
  params.seed = randomUInt32();
  const data = { discord, params };
  const res = await postRequest(`${ENDPOINT}/generate`, data);
  if (!res.isSuccess) {
    interaction.editReply('Failed To Request');
    return;
  }
  const taskId = res.data.task_id;
  const user = interaction.user.toString();
  let description = `task_id: ${taskId}\n`;
  const messageEmbed = new EmbedBuilder()
    .setColor(Colors.Green)
    .setTitle(`Prompt : ${params.prompt}`)
    .setDescription(description);
  await interaction.editReply({ embeds: [messageEmbed], content: `${user} Your task is successfully requested.` });
  // PENDING -> ASSIGNED
  let result = (await waitForStatusChange(ResponseStatus.PENDING, taskId)) as ITextToImageResponse;
  await interaction.editReply({
    embeds: [messageEmbed],
    content: `${user} Your task's status is updated from ${ResponseStatus.PENDING} to ${ResponseStatus.ASSIGNED}`,
  });
  // ASSIGNED -> COMPLETED
  if (result.status === ResponseStatus.ASSIGNED) {
    result = (await waitForStatusChange(ResponseStatus.ASSIGNED, taskId)) as ITextToImageResponse;
  }
  if (result.result.grid.is_filtered) {
    description += `${WarningMessages.NSFW}\n`;
    messageEmbed.setColor(Colors.Orange).setDescription(description);
  }
  messageEmbed.setImage(result.result.grid.url);
  const buttons0: Array<ButtonBuilder> = [];
  Object.keys(result.result).forEach((key: string) => {
    if (key !== 'grid') {
      buttons0.push(
        new ButtonBuilder()
          .setCustomId(`singleImage@${taskId}@${key}`)
          .setLabel(`#${key}`)
          .setStyle(ButtonStyle.Secondary),
      );
    }
  });
  buttons0.push(new ButtonBuilder().setCustomId(`regenerate@${taskId}`).setEmoji('🔁').setStyle(ButtonStyle.Secondary));
  const twitterBaseURL = 'https://twitter.com/intent/tweet';
  const imageURL =
    NODE_ENV === NODE_ENVS.DEV
      ? `https://aindao-text-to-art-dev.ainetwork.xyz/${taskId}`
      : `https://aindao-text-to-art.ainetwork.xyz/${taskId}`;
  // TODO(@byeongal) get message from data base
  const mainText =
    "It AIN't difficult to draw a picture if you use Text-to-art through #AIN_DAO discord - click the image below to create your own image \n@ainetwork_ai #AINetwork #stablediffusion #text2art #AIN";
  const twitterURL = `${twitterBaseURL}?text=${encodeURIComponent(mainText)}&url=${imageURL}`;
  const row0 = new ActionRowBuilder<ButtonBuilder>().addComponents(buttons0);
  const row1 = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder().setLabel('Share on Twitter').setStyle(ButtonStyle.Link).setURL(twitterURL),
  );
  await interaction.editReply({
    embeds: [messageEmbed],
    content: `${user} Your task is completed.`,
    components: [row0, row1],
  });
  // TODO(@byeongal) migrate to NFT Server
  const txResult = (await waitForTxStatusChange(taskId)) as {
    status: string;
    tx_hash: { [status: string]: string };
    updated_at: number;
  };
  const prefix = NODE_ENV === NODE_ENVS.DEV ? 'testnet-' : '';
  const txHash = txResult.tx_hash[ResponseStatus.COMPLETED];
  const insightURL = `https://${prefix}insight.ainetwork.ai/transactions/${txHash}`;
  row1.addComponents(new ButtonBuilder().setLabel('View on Insight').setStyle(ButtonStyle.Link).setURL(insightURL));
  await interaction.editReply({
    embeds: [messageEmbed],
    content: `${user} Your task is completed.`,
    components: [row0, row1],
  });
};

export const regenerateButton = new Button('regenerate', regenerate);
