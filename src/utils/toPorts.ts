import { PortMap } from '@dashboard/docker/containers';
import { randomPort } from '@dashboard/utils';

interface Port {
  src: number
  dest: number
  protocol?: 'tcp' | 'udp'
}

const isTesting = process.env.NODE_ENV === 'test';
const isProduction = process.env.NODE_ENV === 'production';

export default (arr: Port[], traefikPort?: number) => arr.reduce(
  (obj, port) => {
    if (!port.src || !port.dest) {
      return obj;
    }
    if ((port.src === traefikPort) && isProduction) {
      return obj;
    }

    return {
      ...obj,
      [`${port.src}/${port.protocol || 'tcp'}`]: [
        {
          HostPort: `${isTesting ? randomPort() : port.dest}`,
        },
      ],
    };
  },
  {} as PortMap,
);
