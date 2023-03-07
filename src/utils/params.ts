import { getRequest } from './base';
import envs from '../common/envs';
import { errorHandler } from './error';

const { ENDPOINT } = envs;

export const getParamsText = async (taskId: string): Promise<string | null> => {
  try {
    const { isSuccess, data } = await getRequest(`${ENDPOINT}/tasks/${taskId}/params`);
    if (!isSuccess) {
      return null;
    }
    let paramsText = '';
    Object.entries(data).forEach(([paramName, paramValue]) => {
      paramsText += `> **${paramName}**\n> ${paramValue}\n`;
    });

    return paramsText;
  } catch (error) {
    const errorMessage = errorHandler(error);
    return errorMessage;
  }
};
