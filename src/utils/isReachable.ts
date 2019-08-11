import axios, { AxiosError } from 'axios';

async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function isReachable(url: string): Promise<boolean> {
  return new Promise(async (resolve) => {
    await axios.get(url).catch((err: AxiosError) => {
      if (err.response) {
        resolve(true);
      } else {
        resolve(false);
      }
    });

    resolve(true);
  });
}

export async function waitUntilReachable(url: string): Promise<void> {
  return new Promise(async (resolve) => {
    let reachable = false;

    while (!reachable) {
      reachable = await isReachable(url);
      if (reachable) {
        resolve();
      } else {
        await sleep(250);
      }
    }
  });
}

export default {
  isReachable,
  waitUntilReachable,
};
