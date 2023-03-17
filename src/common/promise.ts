import { SECOND } from './constants';
import { ResponseStatus } from './enums';
import { getRequest } from './utils';

const promiseWithTimeout = <T>(promise: Promise<T>, timeout: number = 300 * SECOND) => {
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => {
      reject(new Error('Timeout Error'));
    }, timeout);
  });
  return Promise.race([promise, timeoutPromise]);
};

export const waitForStatusChange = async (prevStatus: ResponseStatus, endpoint: string) => {
  let intervalId: NodeJS.Timer;
  const promise = new Promise((resolve, reject) => {
    intervalId = setInterval(async () => {
      const res = await getRequest(endpoint);
      if (!res.isSuccess) {
        reject(new Error('Error'));
      }
      if (res.data.status !== prevStatus) {
        clearInterval(intervalId);
        resolve(res.data);
      }
    }, SECOND);
  });
  const cancel = () => clearInterval(intervalId);
  const result = await promiseWithTimeout(promise);
  cancel();
  return result;
};
