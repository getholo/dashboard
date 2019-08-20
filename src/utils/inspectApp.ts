import axios, { AxiosError, AxiosResponse } from 'axios';
import { Container } from '@dashboard/types/apps';

const isProduction = process.env.NODE_ENV === 'production';

interface DockerContainer {
  Id: string
  Config: {
    Image: string
    Env: string[]
    Labels: {
      'holo.app': string
      [key: string]: string
    }
  },
  State: {
    Status: 'created' | 'running' | 'paused' | 'restarting' | 'removing' | 'exited' | 'dead'
  },
  HostConfig: {
    PortBindings?: {
      [key: string]: {
        HostIp: string
        HostPort: string
      }[]
    }
  }
}

export type Category = 'download-client' | 'media-server' | 'content-manager' | 'other'

export default async function inspect<T extends string>(id: T): Promise<Container> {
  const { data } = await axios.request<DockerContainer>({
    socketPath: '/var/run/docker.sock',
    method: 'GET',
    url: `/containers/${id}/json`,
    params: {
      filters: {
        label: 'holo.app',
      },
    },
  }).catch((err: AxiosError): AxiosResponse<DockerContainer> => {
    if (err.response && err.response.status === 404) {
      return {
        ...err.response,
        data: undefined,
      };
    }

    throw err;
  });

  if (!data) {
    return undefined;
  }

  const internalPort = data.Config.Labels[`traefik.http.services.${id}.loadbalancer.server.port`];
  let port: number;

  if (data.HostConfig && data.HostConfig.PortBindings) {
    const portMap = Object.entries(data.HostConfig.PortBindings).find(
      ([key]) => key.split('/')[0] === internalPort,
    );

    if (portMap) {
      port = +portMap[1][0].HostPort;
    }
  }

  let url: string;
  const host = data.Config.Labels[`traefik.http.routers.${id}.rule`];

  if (host) {
    url = isProduction
      ? `https://${host.replace('Host(`', '').replace('`)', '')}`
      : `http://localhost:${port}`;
  }

  return {
    name: id,
    env: data.Config.Env,
    labels: data.Config.Labels,
    id: data.Id,
    image: data.Config.Image,
    internalPort: +internalPort,
    port,
    url,
  };
}
