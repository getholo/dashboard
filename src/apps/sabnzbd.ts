import App from '@dashboard/types/apps';
import Variables from '@dashboard/variables';

// Nzbdrone integration imports
import { addClientToManagers } from '@dashboard/integrations/nzbdrone';
import { Sabnzbd } from '@dashboard/integrations/nzbdrone/downloadClients';
import { waitUntilReachable } from '@dashboard/utils/isReachable';

// getCredentials() Imports => apiKey
import { join } from 'upath';
import { readFile, writeFile } from 'fs-extra';

const categories = `
[categories]
[[*]]
priority = 0
pp = 3
name = *
script = None
newzbin = ""
order = 0
dir = ""
`;

const sabnzbd = new App({
  name: 'sabnzbd',
  category: 'download-client',
  image: 'linuxserver/sabnzbd:latest',
  traefik: 8080,
  ports: [
    {
      src: 8080,
      dest: 9889,
    },
  ],
  paths: [
    {
      src: Variables.global.appdata,
      dest: '/config',
    },
  ],
  functions: {
    configReady: async (appPath: string) => {
      const path = join(appPath, 'sabnzbd.ini');
      const config = await readFile(path, 'utf-8');
      if (!config.includes('[categories]')) {
        await writeFile(path, config.concat(categories));
        return false;
      }

      return true;
    },
    getCredentials: async (appPath: string) => {
      const path = join(appPath, 'sabnzbd.ini');
      const config = await readFile(path, 'utf-8');
      const withoutComments = config.replace(/^#(.*)\n/gm, '');
      const withoutEmptyLines = withoutComments.replace(/^\s*[\r\n]/gm, '');

      const { groups: { api_key } } = withoutEmptyLines.match(/api_key = (?<api_key>.*)/);

      return {
        apiKey: api_key,
      };
    },
  },
});

sabnzbd.postInstall = async (app) => {
  const { url, internalPort } = await app.inspect();
  await waitUntilReachable(url);

  const config = app.paths.find(path => path.dest === '/config');
  const { apiKey } = await app.functions.getCredentials(config.src);

  const client = new Sabnzbd({
    name: `holo-${app.id}`,
    host: app.id,
    enable: true,
    port: internalPort,
    apiKey,
  });

  if (!await app.functions.configReady(config.src)) {
    await app.stop();
    await app.start();
    await waitUntilReachable(url);
  }

  await addClientToManagers(client);
};

export default sabnzbd;
