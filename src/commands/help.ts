import { CommandInteraction } from 'discord.js';
import Command from './commands';

const getHelpText = (): string => {
  const generateParameters = [
    {
      name: 'prompt',
      value: "A description of what you'd like the machine to generate.",
      condition: 'required | string',
    },
    {
      name: 'steps',
      value: 'How many steps to spend generating (diffusing) your image.',
      condition: 'integer | min: 1 | max: 100 | default: 50',
    },
    {
      name: 'seed',
      value: 'The seed used to generate your image.',
      condition: 'integer | min: 0 | max: 4294967295 | default: random integer',
    },
    {
      name: 'width',
      value: 'The width of the generated image.',
      condition: 'integer | min: 512 | max: 1024 | default: 768',
    },
    {
      name: 'height',
      value: 'The height of the generated image.',
      condition: 'integer | min: 512 | max: 1024 | default: 768',
    },
    {
      name: 'images',
      value: 'How many images you wish to generate.',
      condition: 'integer | min: 1 | max: 4 | default: 2',
    },
    {
      name: 'guidance_scale',
      value: 'How much the image will be like your prompt. Higher values keep your image closer to your prompt.',
      condition: 'number | min: 0 | max: 20 | default: 7',
    },
    {
      name: 'model_id',
      value: 'name of diffusion model.',
      condition: 'string | default: `stable-diffusion-v2-1-768`',
    },
    {
      name: 'negative_prompt',
      value: 'negative prompting indicates which terms you do not want to see in the resulting image.',
      condition: 'string | default: ` `',
    },
    {
      name: 'scheduler_type',
      value: 'diffusers scheduler type',
      condition: 'string | default: `ddim`',
    },
  ];
  const generateTitle = '/generate';
  const generateInfo = 'Generates images from text.';
  let generateDescription = '';
  generateParameters.forEach((e) => {
    generateDescription += ` - ${e.name} \n> ${e.value}\n> ${e.condition}\n`;
  });

  const resultParameters = [
    {
      name: 'task_id',
      value: 'A task id string obtained when generating an image',
      condition: 'required | string',
    },
  ];
  const resultTitle = '/result';
  const resultInfo = 'Shows generating results from task id.';
  let resultDescription = '';
  resultParameters.forEach((e) => {
    resultDescription += ` - ${e.name} \n> ${e.value}\n> ${e.condition}\n`;
  });

  const paramsParameters = [
    {
      name: 'task_id',
      value: 'A task id string obtained when generating an image',
      condition: 'required | string',
    },
  ];
  const paramsTitle = '/params';
  const paramsInfo = 'Shows request parameters from task id.';
  let paramsDescription = '';
  paramsParameters.forEach((e) => {
    paramsDescription += ` - ${e.name} \n> ${e.value}\n> ${e.condition}\n`;
  });

  let content = `**${generateTitle}** \n ${generateInfo} \n>${generateDescription}\n`;
  content += `**${resultTitle}** \n ${resultInfo} \n>${resultDescription}\n`;
  content += `**${paramsTitle}** \n ${paramsInfo} \n>${paramsDescription}`;
  return content;
};

const help = async (interaction: CommandInteraction) => {
  const helpText = getHelpText();
  await interaction.reply(helpText);
};
export const helpCommand = new Command('help', 'Show help for bot', help);
