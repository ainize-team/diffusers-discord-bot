import { ButtonInteraction } from 'discord.js';
import { getRequest, randomUInt32, postRequest } from '../common/utils';
import envs from '../common/envs';
import { DiscordColors, ResponseStatus } from '../common/enums';
import Button from './buttons';

import { ITextToImageResponse } from '../types/diffusers';
import { waitForStatusChange, waitForTxStatusChange } from '../common/promise';
import { buildEmbed, buildTextToImageEmbed, buildTextToImageEmbedWithURLButton } from '../common/discord';
import { ITxResult } from '../types';

const { ENDPOINT } = envs;

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
  const description = `task_id: ${taskId}\n`;
  const title = `Prompt : ${params.prompt}`;
  const messageEmbed = buildEmbed(description, title);
  await interaction.editReply({ embeds: [messageEmbed], content: `${user} Your task is successfully requested.` });
  // PENDING -> ASSIGNED
  let result = (await waitForStatusChange(
    ResponseStatus.PENDING,
    `${ENDPOINT}/tasks/${taskId}/images`,
  )) as ITextToImageResponse;
  if (result.status === ResponseStatus.ERROR) {
    messageEmbed.setColor(DiscordColors.ERROR).setDescription('An error has occurred. Please try again.');
    await interaction.editReply({
      embeds: [messageEmbed],
      content: `${user} Your task's status is updated from ${ResponseStatus.PENDING} to ${ResponseStatus.ERROR}`,
    });
    return;
  }
  await interaction.editReply({
    embeds: [messageEmbed],
    content: `${user} Your task's status is updated from ${ResponseStatus.PENDING} to ${ResponseStatus.ASSIGNED}`,
  });
  // ASSIGNED -> COMPLETED
  if (result.status === ResponseStatus.ASSIGNED) {
    result = (await waitForStatusChange(
      ResponseStatus.ASSIGNED,
      `${ENDPOINT}/tasks/${taskId}/images`,
    )) as ITextToImageResponse;
    if (result.status === ResponseStatus.ERROR) {
      messageEmbed.setColor(DiscordColors.ERROR).setDescription('An error has occurred. Please try again.');
      await interaction.editReply({
        embeds: [messageEmbed],
        content: `${user} Your task's status is updated from ${ResponseStatus.ASSIGNED} to ${ResponseStatus.ERROR}`,
      });
    }
  }
  let embeds;
  let components;
  ({ embeds, components } = buildTextToImageEmbed(description, title, taskId, result));
  await interaction.editReply({
    embeds,
    content: `${user} Your task is completed.`,
    components,
  });
  const txResult = (await waitForTxStatusChange(`${ENDPOINT}/tasks/${taskId}/tx-hash`)) as ITxResult;
  ({ embeds, components } = buildTextToImageEmbedWithURLButton(description, title, taskId, result, txResult));
  await interaction.editReply({
    embeds,
    content: `${user} Your task is completed.`,
    components,
  });
};

export const regenerateButton = new Button('regenerate', regenerate);
