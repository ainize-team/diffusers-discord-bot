import axios from 'axios';

export const customErrorHandler = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    if (error.response) {
      console.error(error.response.data);
      return error.response.data;
    }
    if (error.request) {
      console.error(error.request);
      return error.message;
    }
    console.error(error.message);
    return error.message;
  }
  console.error('Unexpected error: ', error);
  return 'An unexpected error occurred';
};
