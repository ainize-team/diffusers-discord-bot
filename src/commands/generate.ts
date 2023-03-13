import { Colors, CommandInteraction, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import Command from './commands';
import { ModelID, ModelName, SchedulerName, SchedulerID, ResponseStatus } from '../common/enums';
import { randomUInt32, postRequest, getRequest } from '../common/utils';
import envs from '../common/envs';
import { NODE_ENVS } from '../common/constants';

const { ENDPOINT, NODE_ENV } = envs;

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
  let intervalId: any;
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
  const discord = {
    // TODO(@byeongal) update api server [ remove ]
    user_id: 'string',
    guild_id: 'string',
    channel_id: 'string',
    message_id: 'string',
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
  const messageEmbed = new EmbedBuilder()
    .setColor(Colors.Green)
    .setTitle(`Prompt : ${prompt}`)
    .setDescription(`Task Id : ${taskId}`);
  await interaction.editReply({ embeds: [messageEmbed], content: `${user} Your task is successfully requested.` });
  // PENDING -> ASSIGNED
  let result = (await waitForStatusChange(ResponseStatus.PENDING, taskId)) as {
    status: string;
    updated_at: number;
    result: any;
  };
  await interaction.editReply({
    embeds: [messageEmbed],
    content: `${user} Your task's status is updated from ${ResponseStatus.PENDING} to ${ResponseStatus.ASSIGNED}`,
  });
  // ASSIGNED -> COMPLETED
  if (result.status === ResponseStatus.ASSIGNED) {
    result = (await waitForStatusChange(ResponseStatus.ASSIGNED, taskId)) as {
      status: string;
      updated_at: number;
      result: any;
    };
  }
  messageEmbed.setImage(result.result.grid.url);

  const buttons0: Array<ButtonBuilder> = [];
  Object.keys(result.result).forEach((key: string) => {
    if (key !== 'grid') {
      buttons0.push(
        new ButtonBuilder().setCustomId(`singleImage@${taskId}@${key}`).setLabel(key).setStyle(ButtonStyle.Primary),
      );
    }
  });
  const twitterBaseURL = 'https://twitter.com/intent/tweet';
  const imageURL =
    NODE_ENV === NODE_ENVS.DEV
      ? `https://aindao-text-to-art-dev.ainetwork.xyz/${taskId}`
      : `https://aindao-text-to-art.ainetwork.xyz/${taskId}`;
  const mainText =
    "It AIN't difficult to draw a picture if you use Text-to-art through #AIN_DAO discord - click the image below to create your own image \n@ainetwork_ai #AINetwork #stablediffusion #text2art #AIN";
  const twitterURL = `${twitterBaseURL}?text=${encodeURIComponent(mainText)}&url=${imageURL}`;
  const row0 = new ActionRowBuilder<ButtonBuilder>().addComponents(buttons0);
  const row1 = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder().setLabel('Share on Twitter').setStyle(ButtonStyle.Link).setURL(twitterURL),
  );
  await interaction.editReply({
    embeds: [messageEmbed],
    content: `${user} Your task's status is updated from ${ResponseStatus.ASSIGNED} to ${ResponseStatus.COMPLETED}`,
    components: [row0, row1],
  });
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
    content: `${user} Your task's status is updated from ${ResponseStatus.ASSIGNED} to ${ResponseStatus.COMPLETED}`,
    components: [row0, row1],
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

generateCommand.addNumberCommandOption({
  name: 'guidance_scale',
  description: 'How much the image will be like your prompt. Higher values keep your image closer to your prompt.',
  isRequired: false,
  minValue: 0,
  maxValue: 20,
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

generateCommand.addStringCommandOption({
  name: 'negative_prompt',
  description: 'prompt value that you do not want to see in the resulting image',
  isRequired: false,
  maxLength: 250,
});
