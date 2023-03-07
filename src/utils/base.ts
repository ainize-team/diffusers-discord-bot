import axios from 'axios';
import { errorHandler } from './error';

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
    const errorMessage = errorHandler(error);
    return {
      isSuccess: false,
      data: errorMessage,
    };
  }
};
