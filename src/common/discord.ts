import { ButtonBuilder, EmbedBuilder, ButtonStyle, ActionRowBuilder } from 'discord.js';
import { ITextToImageResponse, ITxResult } from '../types';
import { NODE_ENVS } from './constants';
import { DiscordColors, ResponseStatus, WarningMessages } from './enums';
import envs from './envs';

const { NODE_ENV } = envs;

export const buildEmbed = (description: string, title: string, color: DiscordColors = DiscordColors.DEFAULT) => {
  const messageEmbed = new EmbedBuilder().setColor(color).setTitle(title).setDescription(description);
  return messageEmbed;
};

export const buildTextToImageEmbed = (
  description: string,
  title: string,
  taskId: string,
  result: ITextToImageResponse,
) => {
  const messageEmbed = buildEmbed(description, title);
  if (result.result.grid.is_filtered) {
    description += `${WarningMessages.NSFW}\n`;
    messageEmbed.setColor(DiscordColors.WARNING).setDescription(description);
  } else {
    messageEmbed.setColor(DiscordColors.SUCCESS);
  }
  messageEmbed.setImage(result.result.grid.url);
  const imageButtons: Array<ButtonBuilder> = [];
  Object.keys(result.result).forEach((key: string) => {
    if (key !== 'grid') {
      imageButtons.push(
        new ButtonBuilder()
          .setCustomId(`singleImage@${taskId}@${key}`)
          .setLabel(`#${key}`)
          .setStyle(ButtonStyle.Secondary),
      );
    }
  });
  imageButtons.push(
    new ButtonBuilder().setCustomId(`regenerate@${taskId}`).setEmoji('🔁').setStyle(ButtonStyle.Secondary),
  );
  const imageRow = new ActionRowBuilder<ButtonBuilder>().addComponents(imageButtons);

  return {
    embeds: [messageEmbed],
    components: [imageRow],
  };
};

export const buildTextToImageEmbedWithURLButton = (
  description: string,
  title: string,
  taskId: string,
  result: ITextToImageResponse,
  txResult: ITxResult,
) => {
  const { embeds, components } = buildTextToImageEmbed(description, title, taskId, result);
  const twitterBaseURL = 'https://twitter.com/intent/tweet';
  const imageURL =
    NODE_ENV === NODE_ENVS.DEV
      ? `https://aindao-text-to-art-dev.ainetwork.xyz/${taskId}`
      : `https://aindao-text-to-art.ainetwork.xyz/${taskId}`;
  // TODO(@byeongal) get message from data base
  const mainText =
    "It AIN't difficult to draw a picture if you use Text-to-art through #AIN_DAO discord - click the image below to create your own image \n@ainetwork_ai #AINetwork #stablediffusion #text2art #AIN";
  const twitterURL = `${twitterBaseURL}?text=${encodeURIComponent(mainText)}&url=${encodeURIComponent(imageURL)}`;
  const urlRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder().setLabel('Share on Twitter').setStyle(ButtonStyle.Link).setURL(twitterURL),
  );
  const prefix = NODE_ENV === NODE_ENVS.DEV ? 'testnet-' : '';
  const txHash = txResult.tx_hash[ResponseStatus.COMPLETED];
  const insightURL = `https://${prefix}insight.ainetwork.ai/transactions/${txHash}`;
  urlRow.addComponents(new ButtonBuilder().setLabel('View on Insight').setStyle(ButtonStyle.Link).setURL(insightURL));
  return {
    embeds,
    components: [...components, urlRow],
  };
};
