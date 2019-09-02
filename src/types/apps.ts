import docker from '@dashboard/docker';
import VariablesBackend, { getVariable } from '@dashboard/variables/backend';
import { globals } from '@dashboard/variables';

import nanoid from 'nanoid/generate';

import {
  toEnv, toLabels, toPorts, inspectApp, toExposedPorts,
} from '@dashboard/utils';

import { userInfo, homedir } from 'os';
import { join } from 'upath';
import { remove } from 'fs-extra';

interface Port {
  src: number
  dest: number
  protocol?: 'tcp' | 'udp'
}

export type Category = 'download-client' | 'media-server' | 'content-manager' | 'other'

export interface Container {
  env: string[]
  labels: {
    [key: string]: string
  }
  name: string
  id: string
  image: string
  internalPort: number
  port: number
  url: string
}

export interface Traefik2 {
  enable: boolean
  http?: {
    routers?: {
      [key: string]: {
        entrypoints?: string
        middlewares?: string
        rule?: string
        tls?: {
          certresolver?: string
          'domains[0]'?: {
            main?: string,
            sans?: string,
          }
        }
      }
    }
    services?: {
      [key: string]: {
        loadbalancer?: {
          server?: {
            port?: number
          }
        }
      }
    },
    middlewares?: {
      [key: string]: {
        redirectscheme?: {
          permanent?: boolean,
          scheme?: 'https'
        }
      }
    }
  }
}

type TraefikOptions = number | false | Traefik2;

const dashboard = join(homedir(), '.getholo', 'dashboard');
const isTesting = process.env.NODE_ENV === 'test';

function getTraefik(traefik: TraefikOptions, app: string, domain: string) {
  if (typeof traefik === 'number') {
    return {
      enable: true,
      http: {
        middlewares: {
          redirect: {
            redirectscheme: {
              permanent: true,
              scheme: 'https',
            },
          },
        },
        routers: {
          [app]: {
            entrypoints: 'websecure',
            rule: `Host(\`${app}.${domain}\`)`,
            tls: {
              certresolver: 'acmedns',
              'domains[0]': {
                main: `*.${domain}`,
              },
            },
          },
          [`${app}-redirect`]: {
            entrypoints: 'web',
            middlewares: 'redirect',
            rule: `Host(\`${app}.${domain}\`)`,
          },
        },
        services: {
          [app]: {
            loadbalancer: {
              server: {
                port: traefik,
              },
            },
          },
        },
      },
    } as Traefik2;
  }
  if (traefik === false) {
    return {
      enable: false,
    } as Traefik2;
  }

  return traefik;
}

type MaybePromise<Original> = Original | Promise<Original>

type MultiPaths = {
  [key: string]: {
    src: string
    dest: string
    readOnly?: boolean
  }
}

interface Config<
  appName extends string,
  Cat extends Category,
  Variables extends { [key: string]: string },
  Functions extends {
    [key: string]: <T>(arg: T) => MaybePromise<any>
  },
  Paths extends MultiPaths,
> {
  name: appName
  image: string
  category: Cat;
  commands?: string[]
  env?: {
    [key: string]: string
  }
  traefik: TraefikOptions
  paths?: Paths
  ports?: Port[]

  functions?: Functions

  // @dashboard/variables => database abstraction layer
  variables?: Variables
}

export default class App<
  appName extends string,
  Cat extends Category,
  Variables extends { [key: string]: string },
  Functions extends {
    [key: string]: (arg: any) => MaybePromise<any>
  },
  Paths extends MultiPaths,
  > {
  constructor(public config: Config<appName, Cat, Variables, Functions, Paths>) {
    // who the f needs a constructor anyways?
  }

  public functions = this.config.functions;

  public preInstall: (app: this) => MaybePromise<Config<appName, Cat, Variables, Functions, Paths>>
  public postInstall: (app: this) => any

  public readonly id: appName | string = process.env.NODE_ENV === 'test'
    ? `${this.config.name}-${nanoid('0123456789abcdefghijklmnopqrstuvwxyz', 20)}`
    : this.config.name

  public category = this.config.category;
  public name = this.config.name;
  public variables = new VariablesBackend(this.id, this.config.variables)

  private containerPaths = {
    appdata: join(dashboard, 'containers', this.id),
    shared: join(dashboard, 'shared'),
  }

  private resolvePath(path: string, dir: string): string {
    if (path.startsWith(globals.appdata)) {
      return join(this.containerPaths.appdata, dir);
    }

    return path;
  }

  public paths: Paths = Object.entries(this.config.paths).reduce(
    (object, [key, path]) => ({
      ...object,
      [key]: {
        src: this.resolvePath(path.src, key),
        dest: path.dest,
        readOnly: path.readOnly,
      },
    }),
    {} as Paths,
  );

  async pullImage() {
    await docker.images.pull(this.config.image);
  }

  async start() {
    await docker.containers.start(this.id);
  }

  async stop() {
    await docker.containers.stop(this.id);
  }

  async remove(force?: boolean, deleteAppdata?: boolean) {
    await docker.containers.remove(this.id, force);
    if (deleteAppdata) {
      try {
        await remove(this.containerPaths.appdata);
      } catch {
        // might crash on Travis
      }
    }
  }

  async inspect(): Promise<Container> {
    return inspectApp(this.id);
  }

  async create() {
    const domain = isTesting ? 'test.com' : await getVariable('domain', 'acmedns');
    if (!domain) {
      throw Error('DOMAIN_NOT_SETUP');
    }

    const config = this.preInstall
      ? await this.preInstall(this)
      : this.config;

    const traefik = getTraefik(config.traefik, this.id, domain);

    const labels = {
      ...toLabels(traefik, 'traefik'),
      'holo.app': this.name,
      ...(
        isTesting && process.env.integration && {
          'holo.testing': process.env.integration,
        }
      ),
    };

    const { gid, uid } = userInfo();
    const env = toEnv({
      ...config.env,
      GUID: uid,
      PUID: gid,
    });

    const traefikPort = !traefik.enable
      ? undefined
      : traefik.http.services[this.id].loadbalancer.server.port;

    const withTraefikPort: Port[] = [
      {
        src: traefikPort,
        dest: traefikPort,
      },
      ...config.ports || [],
    ];

    const ports = toPorts(withTraefikPort, traefikPort);
    const exposedPorts = toExposedPorts(ports);

    const paths = Object.values(this.paths).map(
      ({ src, dest, readOnly }) => `${src}:${dest}:${readOnly ? 'ro' : 'rw'}`,
    );

    await docker.images.pull(config.image);

    const networks = await docker.networks.list();
    if (!networks.find(network => network.Name === 'holo')) {
      await docker.networks.create('holo');
    }

    await docker.containers.create(this.id, {
      Cmd: config.commands,
      Env: env,
      Image: config.image,
      Labels: labels,
      HostConfig: {
        Binds: paths,
        PortBindings: ports,
        RestartPolicy: {
          Name: 'unless-stopped',
        },
      },
      NetworkingConfig: {
        EndpointsConfig: {
          holo: {
            Aliases: [
              this.id,
            ],
          },
        },
      },
      ExposedPorts: exposedPorts,
    });

    await docker.containers.start(this.id);

    if (this.postInstall && !isTesting) {
      await this.postInstall(this);
    }
  }
}
