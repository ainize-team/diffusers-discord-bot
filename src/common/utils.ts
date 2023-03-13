import axios from 'axios';
import { customErrorHandler } from './error';

export const getRequest = async (endpoint: string) => {
  try {
    const res = await axios.get(endpoint);
    if (res.status === 200) {
      return {
        isSuccess: true,
        data: res.data,
      };
    }
    return {
      isSuccess: false,
      data: res.data,
    };
  } catch (error) {
    const errorMessage = customErrorHandler(error);
    return {
      isSuccess: false,
      data: errorMessage,
    };
  }
};

export const postRequest = async (endpoint: string, data: unknown) => {
  try {
    const res = await axios.post(endpoint, data);
    if (res.status === 200) {
      return {
        isSuccess: true,
        data: res.data,
      };
    }
    return {
      isSuccess: false,
      data: res.data,
    };
  } catch (error) {
    const errorMessage = customErrorHandler(error);
    return {
      isSuccess: false,
      data: errorMessage,
    };
  }
};

export const randomUInt32 = () => Math.floor(Math.random() * 4294967296);

export const parseCustomId = (customId: string, delimiter = '@') => {
  const splitted = customId.split(delimiter);
  if (splitted.length < 2) {
    return {
      name: splitted[0],
      options: [],
    };
  }
  return {
    name: splitted[0],
    options: splitted.slice(1),
  };
};
