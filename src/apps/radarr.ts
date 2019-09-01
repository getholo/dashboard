// Default Import
import App from '@dashboard/types/apps';
import Variables from '@dashboard/variables';

// OnInspect Imports => ApiKey
import { join } from 'upath';
import { readFile } from 'fs-extra';

// PostInstall Imports, Nzbdrone integration
import { Nzbdrone } from '@dashboard/integrations';
import { waitUntilReachable } from '@dashboard/utils/isReachable';

const radarr = new App({
  name: 'radarr',
  category: 'content-manager',
  image: 'linuxserver/radarr:latest',
  traefik: 7878,
  paths: {
    config: {
      src: Variables.global.appdata,
      dest: '/config',
    },
  },
  functions: {
    getApiKey: async (appPath: string) => {
      const path = join(appPath, 'config.xml');

      const config = await readFile(path, 'utf-8');
      const { groups: { apiKey } } = config.match(/<ApiKey>(?<apiKey>.*)<\/ApiKey>/);

      return apiKey;
    },
  },
});

radarr.postInstall = async (app) => {
  const { url } = await app.inspect();

  await waitUntilReachable(url);
  const config = app.paths.config.src;
  const apiKey = await app.functions.getApiKey(config);
  const api = new Nzbdrone(url, apiKey, 'radarr');

  await api.removeExistingContainers();
  await api.addCurrentContainers();
};

export default radarr;
