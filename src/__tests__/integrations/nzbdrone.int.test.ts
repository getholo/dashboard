import { cleanup, prepare } from '@dashboard/utils/testing';
import nzbget from '@dashboard/apps/nzbget';
import radarr from '@dashboard/apps/radarr';
import sonarr from '@dashboard/apps/sonarr';

import Nzbdrone from '@dashboard/integrations/nzbdrone';
import { waitUntilReachable } from '@dashboard/utils/isReachable';

// 15 minutes
jest.setTimeout(15 * 60 * 1000);
process.env.integration = 'nzbdrone';
let path: string;

type name = 'radarr' | 'sonarr'

const apis = {} as {
  [key in name]: Nzbdrone
};

beforeAll(async () => {
  path = await prepare();

  await Promise.all([
    radarr.create(),
    sonarr.create(),
  ]);

  await Promise.all(
    [sonarr, radarr].map(
      async (app) => {
        const { url } = await app.inspect();
        await waitUntilReachable(url);

        const config = app.paths.find(({ dest }) => dest === '/config').src;
        const apikey = await app.functions.getApiKey(config);
        apis[app.name] = new Nzbdrone(url, apikey);
      },
    ),
  );
});

afterAll(async () => {
  await Promise.all([
    radarr.remove(true, true),
    sonarr.remove(true, true),
  ]);

  await cleanup(path);
});

describe('Integrations: Nzbdrone', () => {
  beforeEach(async () => {
    await apis.radarr.removeExistingContainers();
    await apis.sonarr.removeExistingContainers();
  });

  describe('Nzbget', () => {
    beforeAll(async () => {
      await nzbget.create();
    });

    it('When installing NZBGet, we should see it pop up in Sonarr', async () => {
      // Arrange
      await nzbget.postInstall(nzbget);

      // Act
      const data = await apis.sonarr.list();

      // Assert
      expect(data.length).toEqual(1);
      expect(data[0].implementation).toEqual('Nzbget');
    });

    it('When installing NZBGet, we should see it pop up in Radarr', async () => {
      // Arrange
      await nzbget.postInstall(nzbget);

      // Act
      const data = await apis.radarr.list();

      // Assert
      expect(data.length).toEqual(1);
      expect(data[0].implementation).toEqual('Nzbget');
    });

    it('When installing Sonarr, we should see NZBGet pop up', async () => {
      // Arrange
      await sonarr.postInstall(sonarr);

      // Act
      const data = await apis.sonarr.list();

      // Assert
      expect(data.length).toEqual(1);
      expect(data[0].implementation).toEqual('Nzbget');
    });

    it('When installing Radarr, we should see NZBGet pop up', async () => {
      // Arrange
      await radarr.postInstall(radarr);

      // Act
      const data = await apis.radarr.list();

      // Assert
      expect(data.length).toEqual(1);
      expect(data[0].implementation).toEqual('Nzbget');
    });

    afterAll(async () => {
      await nzbget.remove(true, true);
    });
  });
});
