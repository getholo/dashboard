import { PortMap } from '@dashboard/docker/containers';

interface ExposedPorts {
  [key: string]: {}
}

export default (map: PortMap): ExposedPorts => Object.entries(map).reduce(
  (obj, [key]) => ({
    ...obj,
    [key]: {},
  }),
  {} as ExposedPorts,
);
