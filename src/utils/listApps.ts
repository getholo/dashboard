import Apps from '@dashboard/apps';
import axios from 'axios';

interface DockerContainer {
  Id: string
  Labels: {
    'holo.app': keyof typeof Apps
  }
}

export default async function list(): Promise<typeof Apps[keyof typeof Apps][]> {
  const { data } = await axios.request<DockerContainer[]>({
    socketPath: '/var/run/docker.sock',
    method: 'GET',
    url: '/containers/json',
    params: {
      all: true,
      filters: {
        label: [
          'holo.app',
          ...process.env.NODE_ENV === 'test' && process.env.integration ? [
            `holo.testing=${process.env.integration}`,
          ] : [],
        ],
      },
    },
  });

  return Promise.all(
    data.map(
      async ({ Labels }) => {
        const app = await import(`@dashboard/apps/${Labels['holo.app']}`);
        return app.default;
      },
    ),
  );
}
