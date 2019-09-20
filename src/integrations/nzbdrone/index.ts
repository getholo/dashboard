import { listApps } from '@dashboard/utils';
import { waitUntilReachable } from '@dashboard/utils/isReachable';

import retry from 'async-retry';
import axios, { AxiosInstance, AxiosError } from 'axios';

import {
  Deluge, Nzbget, Sabnzbd, Transmission,
} from './downloadClients';

type Client =
  | Deluge
  | Nzbget
  | Sabnzbd
  | Transmission

type withId<T extends Client> = T & { id: number }

export default class Nzbdrone {
  private fetch: AxiosInstance

  constructor(baseURL: string, apiKey: string, private app?: 'sonarr' | 'radarr') {
    this.fetch = axios.create({
      baseURL,
      headers: {
        'X-Api-Key': apiKey,
      },
    });
  }

  async add(client: Client) {
    await retry(
      async bail => this.fetch.request({
        method: 'POST',
        url: '/api/downloadclient',
        data: {
          ...client,
          priority: undefined,
          fields: client.fields.map(
            ({ name, value }) => {
              if (this.app !== 'radarr') {
                return {
                  name,
                  value,
                };
              }
              if (name === 'tvCategory') {
                return {
                  name: 'MovieCategory',
                  value,
                };
              }

              if (name === 'recentTvPriority') {
                return {
                  name: 'RecentMoviePriority',
                  value,
                };
              }

              if (name === 'olderTvPriority') {
                return {
                  name: 'OlderMoviePriority',
                  value,
                };
              }

              return {
                name: name.charAt(0).toUpperCase() + name.slice(1),
                value,
              };
            },
          ),
        },
      }).catch((err: AxiosError) => {
        if (!err.response) {
          bail(new Error('Cannot contact Sonarr/Radarr'));
          return;
        }
        if (err.response.status !== 400) {
          bail(new Error('Something went wrong adding the download client to Sonarr/Radarr'));
        }
      }),
      {
        retries: 10,
      },
    );
  }

  async addMultiple(clients: Client[]) {
    return Promise.all(
      clients.map(client => this.add(client)),
    );
  }

  async list(): Promise<withId<Client>[]> {
    const { data } = await this.fetch.request<withId<Client>[]>({
      method: 'GET',
      url: '/api/downloadclient',
    });

    return data;
  }

  async remove(id: number) {
    await this.fetch.request({
      method: 'DELETE',
      url: `/api/downloadclient/${id}`,
    });
  }

  async removeMultiple(ids: number[]) {
    return Promise.all(
      ids.map(id => this.remove(id)),
    );
  }

  // This only removes HOLO containers though!
  async removeExistingContainers() {
    const current = await this.list();
    return Promise.all(
      current.map(
        (client) => {
          if (client.name.startsWith('holo-')) {
            return this.remove(client.id);
          }

          return undefined;
        },
      ),
    );
  }

  async addCurrentContainers() {
    const apps = await listApps();

    return Promise.all(
      apps.map(
        async (app) => {
          if (app.category === 'download-client') {
            const enable = true;
            const name = `holo-${app.id}`;
            const host = app.id;

            if (app.name === 'nzbget') {
              const config = app.paths.config.src;
              const { username, password } = await app.functions.getCredentials(config);
              const { internalPort } = await app.inspect();
              const nzbget = new Nzbget({
                port: internalPort,
                username,
                password,
                enable,
                host,
                name,
              });

              return this.add(nzbget);
            }

            if (app.name === 'sabnzbd') {
              const config = app.paths.config.src;
              const { apiKey } = await app.functions.getCredentials(config);
              const { internalPort, url } = await app.inspect();
              const sabnzbd = new Sabnzbd({
                name: `holo-${app.id}`,
                host: app.id,
                enable: true,
                port: internalPort,
                apiKey,
              });

              if (!await app.functions.configReady(config)) {
                await app.stop();
                await app.start();
                await waitUntilReachable(url);
              }

              return this.add(sabnzbd);
            }
          }

          return undefined;
        },
      ),
    );
  }
}


export async function addClientToManagers(client: Client) {
  const apps = await listApps();

  return Promise.all(
    apps.map(
      async (app) => {
        if (app.category === 'content-manager') {
          const { url } = await app.inspect();
          await waitUntilReachable(url);

          const config = app.paths.config.src;
          const apikey = await app.functions.getApiKey(config);

          return new Nzbdrone(url, apikey, app.name).add(client);
        }

        return undefined;
      },
    ),
  );
}
