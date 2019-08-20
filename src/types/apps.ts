import docker from '@dashboard/docker';
import VariablesBackend from '@dashboard/variables/backend';

import nanoid from 'nanoid/generate';

import {
  toEnv, toLabels, toPorts, inspectApp,
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
        rule?: string
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
    }
  }
}

type TraefikOptions = number | false | Traefik2;

const isTesting = process.env.NODE_ENV === 'test';

function getTraefik(traefik: TraefikOptions, app: string, domain: string) {
  if (typeof traefik === 'number') {
    return {
      enable: true,
      http: {
        routers: {
          [app]: {
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

interface Path<Dest extends string> {
  src: string | 'appdata' | 'media'
  dest: Dest
  readOnly?: boolean
}

interface Config<
  appName extends string,
  Cat extends Category,
  Variables extends { [key: string]: string },
  Functions extends {
    [key: string]: <T>(arg: T) => MaybePromise<any>
  },
  Dest extends string,
> {
  name: appName
  image: string
  category: Cat;
  commands?: string[]
  env?: {
    [key: string]: string
  }
  traefik: TraefikOptions
  paths?: Path<Dest>[]
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
  Dest extends string,
  > {
  constructor(public config: Config<appName, Cat, Variables, Functions, Dest>) {
    // who the f needs a constructor anyways?
  }

  public functions = this.config.functions;
  public postInstall: (app: this) => any

  public readonly id: appName | string = process.env.NODE_ENV === 'test'
    ? `${this.config.name}-${nanoid('0123456789abcdefghijklmnopqrstuvwxyz', 20)}`
    : this.config.name

  public category = this.config.category;
  public name = this.config.name;
  public variables = new VariablesBackend(this.id, this.config.variables)

  private appdataToPath() {
    // removed linux platform as /opt/appdata requires extra permissions
    return join(homedir(), '.getholo', 'dashboard', 'containers', this.id);
  }

  public paths: Path<Dest>[] = this.config.paths.map(
    path => ({
      dest: path.dest,
      src: path.src === 'appdata' ? this.appdataToPath() : path.src,
      readOnly: path.readOnly,
    }),
  )

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
        await remove(this.appdataToPath());
      } catch {
        // might crash on Travis
      }
    }
  }

  async inspect(): Promise<Container> {
    return inspectApp(this.id);
  }

  async create() {
    // const domain = await apps.traefik.variables.get('domain');
    // if (!domain) {
    //   throw Error('DOMAIN_NOT_SETUP');
    // }

    const domain = 'dev.m-rots.com';
    // const config = this.config.preInstall
    //   ? await this.config.preInstall(this.config, await this.variables.getAll())
    //   : this.config;
    const { config } = this;

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

    const paths = (this.paths).map(
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
    });

    await docker.containers.start(this.id);

    if (this.postInstall && !isTesting) {
      await this.postInstall(this);
    }
  }
}
