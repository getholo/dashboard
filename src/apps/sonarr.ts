// Default Import
import App from '@dashboard/types/apps';
import Variables from '@dashboard/variables';

// OnInspect Imports => ApiKey
import { join } from 'upath';
import { readFile } from 'fs-extra';

// PostInstall Imports, Nzbdrone integration
import { Nzbdrone } from '@dashboard/integrations';
import { waitUntilReachable } from '@dashboard/utils/isReachable';

const sonarr = new App({
  name: 'sonarr',
  category: 'content-manager',
  image: 'linuxserver/sonarr:preview',
  traefik: 8989,
  paths: [
    {
      src: Variables.global.appdata,
      dest: '/config',
    },
  ],
  functions: {
    getApiKey: async (appPath: string) => {
      const path = join(appPath, 'config.xml');

      const config = await readFile(path, 'utf-8');
      const { groups: { apiKey } } = config.match(/<ApiKey>(?<apiKey>.*)<\/ApiKey>/);

      return apiKey;
    },
  },
});

sonarr.postInstall = async (app) => {
  const { url } = await app.inspect();

  await waitUntilReachable(url);
  const config = app.paths.find(path => path.dest === '/config');
  const apiKey = await app.functions.getApiKey(config.src);
  const api = new Nzbdrone(url, apiKey, 'sonarr');

  await api.removeExistingContainers();
  await api.addCurrentContainers();
};

export default sonarr;
