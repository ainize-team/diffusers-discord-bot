import { CommandInteraction } from 'discord.js';
import Command from './commands';
import { ModelID, ModelName, SchedulerName, SchedulerID, ResponseStatus, DiscordColors } from '../common/enums';
import { randomUInt32, postRequest } from '../common/utils';
import envs from '../common/envs';
import { ITextToImageResponse } from '../types/diffusers';
import { waitForStatusChange, waitForTxStatusChange } from '../common/promise';
import { buildEmbed, buildTextToImageEmbed, buildTextToImageEmbedWithURLButton } from '../common/discord';
import { ITxResult } from '../types';

const { ENDPOINT } = envs;

const generate = async (interaction: CommandInteraction) => {
  if (!interaction || interaction.user.bot || !interaction.isChatInputCommand() || !interaction.guildId) return;
  const requestParams: { [key: string]: string | number | boolean | undefined } = {};
  interaction.options.data.forEach((data) => {
    requestParams[data.name] = data.value;
  });
  const {
    prompt,
    steps = 30,
    seed = randomUInt32(),
    width = 768,
    height = 768,
    guidance_scale = 7,
    num_images_per_prompt = 2,
    model = ModelID.STABLE_DIFFUSION_V2_1_768,
    scheduler = SchedulerID.DDIM,
    negative_prompt = '',
  } = requestParams;
  await interaction.deferReply();
  const message = await interaction.fetchReply();
  const discord = {
    // TODO(@byeongal) update api server [ remove ]
    user_id: interaction.user.id,
    guild_id: interaction.guildId,
    channel_id: interaction.channelId,
    message_id: message.id,
  };
  const params = {
    prompt,
    negative_prompt,
    steps,
    seed,
    width,
    height,
    images: num_images_per_prompt, // TODO(@byeongal) update api server [ change variable name ]
    guidance_scale,
    model_id: model, // TODO(@byeongal) update api server [ change variable name ]
    scheduler_type: scheduler, // TODO(@byeongal) update api server [ change variable name ]
  };
  const data = { discord, params };
  const res = await postRequest(`${ENDPOINT}/generate`, data);
  if (!res.isSuccess) {
    interaction.editReply('Failed To Request');
    return;
  }
  const taskId = res.data.task_id;
  const user = interaction.user.toString();
  const description = `task_id: ${taskId}\n`;
  const title = `Prompt : ${prompt}`;
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
export const generateCommand = new Command('generate', 'Generate Image', generate);
generateCommand.addStringCommandOption({
  name: 'prompt',
  description: 'Type in a full descriptive sentence, as if you were writing a caption for a photo.',
  isRequired: true,
  maxLength: 250,
});

generateCommand.addIntegerCommandOption({
  name: 'steps',
  description: 'How many steps to spend generating (diffusing) your image.',
  isRequired: false,
  minValue: 10,
  maxValue: 150,
});

generateCommand.addIntegerCommandOption({
  name: 'seed',
  description: 'The seed used to generate your image.',
  isRequired: false,
  minValue: 0,
  maxValue: 4294967295,
});

generateCommand.addIntegerCommandOption({
  name: 'width',
  description: 'The width of the generated image.',
  isRequired: false,
  choices: Array.from({ length: 9 }, (_, index) => ({
    name: `${index * 64 + 512}`,
    value: index * 64 + 512,
  })),
  minValue: 512,
  maxValue: 1024,
});

generateCommand.addIntegerCommandOption({
  name: 'height',
  description: 'The height of the generated image.',
  isRequired: false,
  choices: Array.from({ length: 9 }, (_, index) => ({
    name: `${index * 64 + 512}`,
    value: index * 64 + 512,
  })),
  minValue: 512,
  maxValue: 1024,
});

generateCommand.addIntegerCommandOption({
  name: 'num_images_per_prompt',
  description: 'The number of images to generate per prompt.',
  isRequired: false,
  choices: Array.from({ length: 4 }, (_, index) => ({
    name: `${index + 1}`,
    value: index + 1,
  })),
  minValue: 1,
  maxValue: 4,
});

generateCommand.addNumberCommandOption({
  name: 'guidance_scale',
  description: 'How much the image will be like your prompt. Higher values keep your image closer to your prompt.',
  isRequired: false,
  minValue: 0,
  maxValue: 20,
});

generateCommand.addStringCommandOption({
  name: 'model',
  description: 'name of diffusion model.',
  isRequired: false,
  choices: [
    {
      name: ModelName.STABLE_DIFFUSION_V1_4,
      value: ModelID.STABLE_DIFFUSION_V1_4,
    },
    {
      name: ModelName.STABLE_DIFFUSION_V1_5,
      value: ModelID.STABLE_DIFFUSION_V1_5,
    },
    {
      name: ModelName.STABLE_DIFFUSION_V2,
      value: ModelID.STABLE_DIFFUSION_V2,
    },
    {
      name: ModelName.STABLE_DIFFUSION_V2_768,
      value: ModelID.STABLE_DIFFUSION_V2_768,
    },
    {
      name: ModelName.STABLE_DIFFUSION_V2_1,
      value: ModelID.STABLE_DIFFUSION_V2_1,
    },
    {
      name: ModelName.STABLE_DIFFUSION_V2_1_768,
      value: ModelID.STABLE_DIFFUSION_V2_1_768,
    },
    {
      name: ModelName.OPENJOURNEY_V2,
      value: ModelID.OPENJOURNEY_V2,
    },
  ],
});

generateCommand.addStringCommandOption({
  name: 'negative_prompt',
  description: 'prompt value that you do not want to see in the resulting image',
  isRequired: false,
  maxLength: 250,
});

generateCommand.addStringCommandOption({
  name: 'scheduler',
  description: 'name of scheduler',
  isRequired: false,
  choices: [
    {
      name: SchedulerName.DDIM,
      value: SchedulerID.DDIM,
    },
    {
      name: SchedulerName.PNDM,
      value: SchedulerID.PNDM,
    },
    {
      name: SchedulerName.EULER_DISCRETE,
      value: SchedulerID.EULER_DISCRETE,
    },
    {
      name: SchedulerName.EULER_ANCESTRAL_DISCRETE,
      value: SchedulerID.EULER_ANCESTRAL_DISCRETE,
    },
    {
      name: SchedulerName.HEUN_DISCRETE,
      value: SchedulerID.HEUN_DISCRETE,
    },
    {
      name: SchedulerName.K_DPM_2_DISCRETE,
      value: SchedulerID.K_DPM_2_DISCRETE,
    },
    {
      name: SchedulerName.K_DPM_2_ANCESTRAL_DISCRETE,
      value: SchedulerID.K_DPM_2_ANCESTRAL_DISCRETE,
    },
    {
      name: SchedulerName.LMS_DISCRETE,
      value: SchedulerID.LMS_DISCRETE,
    },
  ],
});
