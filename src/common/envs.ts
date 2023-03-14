import { NODE_ENVS } from './constants';

const ENV_LIST = ['NODE_ENV', 'DISCORD_TOKEN', 'APPLICATION_ID', 'GUILD_ID', 'ENDPOINT', 'UPSCALE_ENDPOINT'];

const envs: { [key: string]: string } = {};

ENV_LIST.forEach((env) => {
  const value = process.env[env] as string;
  if (env === 'NODE_ENV') {
    const nodeEnvValues = Object.values(NODE_ENVS);
    if (nodeEnvValues.includes(value)) {
      envs[env] = value;
    } else {
      throw new Error(`${env} value must be in ${nodeEnvValues}`);
    }
  } else if (value) {
    envs[env] = value;
  }
});

export default envs;
