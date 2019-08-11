import App from '@dashboard/types/apps';
import Variables from '@dashboard/variables';

import { addClientToManagers } from '@dashboard/integrations/nzbdrone';
import { Nzbget } from '@dashboard/integrations/nzbdrone/downloadClients';
import { waitUntilReachable } from '@dashboard/utils/isReachable';

// OnInspect Imports => Username, Password
import { join } from 'upath';
import { readFile } from 'fs-extra';

const nzbget = new App({
  name: 'nzbget',
  category: 'download-client',
  image: 'linuxserver/nzbget:latest',
  traefik: 6789,
  paths: [
    {
      src: Variables.global.appdata,
      dest: '/config',
    },
  ],
  functions: {
    getCredentials: async (appPath: string) => {
      const path = join(appPath, 'nzbget.conf');
      const config = await readFile(path, 'utf-8');
      const withoutComments = config.replace(/^#(.*)\n/gm, '');
      const withoutEmptyLines = withoutComments.replace(/^\s*[\r\n]/gm, '');

      const { groups: { username } } = withoutEmptyLines.match(/ControlUsername=(?<username>.*)/);
      const { groups: { password } } = withoutEmptyLines.match(/ControlPassword=(?<password>.*)/);

      return {
        username,
        password,
      };
    },
  },
});

nzbget.postInstall = async (app) => {
  const { url, internalPort } = await app.inspect();
  await waitUntilReachable(url);

  const config = app.paths.find(path => path.dest === '/config');
  const { username, password } = await app.functions.getCredentials(config.src);
  const client = new Nzbget({
    name: `holo-${app.id}`,
    host: app.id,
    enable: true,
    port: internalPort,
    username,
    password,
  });

  await addClientToManagers(client);
};

export default nzbget;
